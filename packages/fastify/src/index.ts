import { availableParallelism } from 'node:os';

import fastifyPlugin from 'fastify-plugin';

import { builtAssets } from './built-assets.js';
import { devAssets } from './dev-assets.js';
import { pageHtml } from './page-shell.js';
import { ASSETS_PREFIX, DEFAULT_OUT_DIR, HTML_TYPE, STATUS_OK } from './plugin-constants.js';
import { RenderPool } from './render-pool.js';

import type { AddressInfo } from 'node:net';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { JadisPluginOptions, PageAssets } from './types/plugin.type.js';

export type {
  JadisPluginOptions,
  PageResponse,
  RenderPage,
  ServerTools,
  ViteModule,
} from './types/plugin.type.js';

const DEV_WORKERS = 1;

const defaultWorkers = (): number => Math.max(1, availableParallelism() - 1);

const ANY_ADDRESS = new Set(['0.0.0.0', '::']);

/** The host to reach the server at from itself: the address it listens on, or localhost when it listens on all. */
function hostOf(address: AddressInfo): string {
  if (ANY_ADDRESS.has(address.address)) {
    return 'localhost';
  }
  return address.family === 'IPv6' ? `[${address.address}]` : address.address;
}

/** The server's own address, for a render to call its API. */
function originOf(fastify: FastifyInstance): string {
  const address = fastify.server.address();
  return typeof address === 'object' && address !== null
    ? `http://${hostOf(address)}:${address.port}`
    : 'http://localhost';
}

/**
 * Renders the pages of a Jadis app: every GET no other route answers (the API's routes, the build's files) is a page.
 * The app's server entry renders it in a worker thread, from the app's own routes, and the plugin puts it in the
 * page's shell (`index.html`, with `<!--app-head-->` and `<!--app-body-->`).
 *
 * The rest stays Fastify's: the API, cookies and sessions, a hook that sends a visitor without a session to the login
 * page, the cache headers.
 * @example
 * await app.register(jadis, {
 *   entry: 'src/entry-server.ts',
 *   requestData: (request) => ({ cookie: request.headers.cookie ?? '' }),
 *   root: import.meta.dirname,
 * });
 */
async function jadis(fastify: FastifyInstance, options: JadisPluginOptions): Promise<void> {
  const outDir = { ...DEFAULT_OUT_DIR, ...options.outDir };
  const workers = options.workers ?? (options.dev ? DEV_WORKERS : defaultWorkers());
  const pool: { current?: RenderPool } = {};
  const restart = (entryFile: string): void => {
    const previous = pool.current;
    pool.current = new RenderPool(entryFile, workers);
    void previous?.close();
  };
  const assets: PageAssets = options.dev
    ? await devAssets(fastify, options.root, options.entry, options.dev.vite, () => restart(assets.entryFile))
    : await builtAssets(fastify, options.root, options.entry, outDir);
  restart(assets.entryFile);

  fastify.addHook('onClose', async () => {
    await pool.current?.close();
    await assets.close();
  });

  fastify.get('/*', { preHandler: options.preHandler }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url.startsWith(ASSETS_PREFIX) || !pool.current) {
      return reply.callNotFound();
    }
    const job = { origin: originOf(fastify), request: options.requestData?.(request), url: request.url };
    const response = await pool.current.render(job);
    const html = pageHtml(await assets.shell(request.url), response);
    return reply
      .code(response.status ?? STATUS_OK)
      .headers(response.headers ?? {})
      .type(HTML_TYPE)
      .send(html);
  });
}

export default fastifyPlugin(jadis, { fastify: '5.x', name: '@jadis/fastify' });
