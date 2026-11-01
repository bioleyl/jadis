import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import fastifyStatic from '@fastify/static';

import { builtEntryName } from './page-shell.js';
import { INDEX_FILE } from './plugin-constants.js';

import type { FastifyInstance } from 'fastify';
import type { PageAssets } from './types/plugin.type.js';

/**
 * The build: the browser's files served as they are (each a route, the shell excepted, which only renders fill),
 * the shell read once, the server entry from the server build.
 */
export async function builtAssets(
  fastify: FastifyInstance,
  root: string,
  entry: string,
  outDir: { client: string; server: string }
): Promise<PageAssets> {
  const clientDir = resolve(root, outDir.client);
  await fastify.register(fastifyStatic, {
    allowedPath: (path) => path !== `/${INDEX_FILE}`,
    index: false,
    root: clientDir,
    wildcard: false,
  });
  const shell = await readFile(join(clientDir, INDEX_FILE), 'utf8');
  return {
    close: async () => undefined,
    entryFile: resolve(root, outDir.server, builtEntryName(entry)),
    shell: async () => shell,
  };
}
