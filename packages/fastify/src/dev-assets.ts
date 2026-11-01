import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import middie from '@fastify/middie';

import { builtEntryName } from './page-shell.js';
import { DEV_SERVER_DIR, INDEX_FILE } from './plugin-constants.js';

import type { FastifyInstance } from 'fastify';
import type { PageAssets, ViteModule } from './types/plugin.type.js';

type WatchEvent =
  | { code: 'START' | 'BUNDLE_START' | 'END' }
  | { code: 'BUNDLE_END' | 'ERROR'; error?: Error; result: { close(): unknown } };

interface EntryWatcher {
  on(event: 'event', listener: (event: WatchEvent) => void): unknown;
  close(): Promise<void>;
}

const isWatcher = (value: unknown): value is EntryWatcher =>
  typeof value === 'object' && value !== null && 'on' in value && typeof value.on === 'function';

/**
 * Development: Vite serves the browser's modules with hot reload, and the shell with its client; the server entry is
 * rebuilt on every change, after which `rebuilt` is called (the plugin starts fresh workers on it).
 */
export async function devAssets(
  fastify: FastifyInstance,
  root: string,
  entry: string,
  vite: ViteModule,
  rebuilt: () => void
): Promise<PageAssets> {
  const server = await vite.createServer({ appType: 'custom', root, server: { middlewareMode: true } });
  await fastify.register(middie);
  fastify.use(server.middlewares);

  const outDir = resolve(root, DEV_SERVER_DIR);
  const watcher = await vite.build({
    build: { emptyOutDir: true, minify: false, outDir, sourcemap: true, ssr: entry, watch: {} },
    logLevel: 'warn',
    mode: 'development',
    root,
  });
  if (!isWatcher(watcher)) {
    throw new Error('[jadis] Vite did not watch the server entry');
  }
  const firstBuild = Promise.withResolvers<void>();
  const builds = { done: 0 };
  watcher.on('event', (event) => {
    if (event.code === 'BUNDLE_END' || event.code === 'ERROR') {
      event.result.close();
    }
    if (event.code === 'ERROR') {
      fastify.log.error(event.error, '[jadis] the server entry did not build');
    }
    if (event.code !== 'END') {
      return;
    }
    builds.done += 1;
    (builds.done === 1 ? firstBuild.resolve : rebuilt)();
  });
  await firstBuild.promise;

  return {
    close: async () => {
      await watcher.close();
      await server.close();
    },
    entryFile: join(outDir, builtEntryName(entry)),
    shell: async (url) => server.transformIndexHtml(url, await readFile(join(root, INDEX_FILE), 'utf8')),
  };
}
