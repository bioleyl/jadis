// The app's server. Fastify answers the API; @jadis/fastify renders every other page from the app's routes.
//
//   npm run dev     Vite serves the browser's code with hot reload, the server entry is rebuilt on every change
//   npm run build && npm start
import { join } from 'node:path';

import jadis from '@jadis/fastify';
import Fastify from 'fastify';

import { PLANETS } from './planets.ts';

const DEFAULT_PORT = 3000;
const STATUS_NOT_FOUND = 404;
const dev = process.argv.includes('--dev');

const app = Fastify({ logger: true });

// The API: what the pages fetch, in the browser and in a server render alike.
app.get('/api/planets', async () => PLANETS.map(({ id, kind, name }) => ({ id, kind, name })));

// biome-ignore lint/style/useNamingConvention: Fastify names a route's type parameters so
app.get<{ Params: { id: string } }>('/api/planets/:id', async (request, reply) => {
  const planet = PLANETS.find((candidate) => candidate.id === request.params.id);
  return planet ?? reply.code(STATUS_NOT_FOUND).send({ error: 'No such planet' });
});

// Every other GET is a page.
await app.register(jadis, {
  dev: dev ? { vite: await import('vite') } : undefined,
  entry: 'src/entry-server.ts',
  root: join(import.meta.dirname, '..'),
});

await app.listen({ port: Number(process.env.PORT ?? DEFAULT_PORT) });
