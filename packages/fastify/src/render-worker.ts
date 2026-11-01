// A worker thread that renders pages: happy-dom as its DOM, the app's server entry loaded once, then a page per
// message.
import { pathToFileURL } from 'node:url';
import { parentPort, workerData } from 'node:worker_threads';

import { installServerDom, releaseDocumentCaches } from './server-dom.js';

import type { RenderJob, RenderPage, WorkerMessage } from './types/plugin.type.js';

interface ServerEntry {
  render?: RenderPage;
}

const nodeFetch = globalThis.fetch.bind(globalThis);
installServerDom();
// A promise a component leaves rejected must not end the thread: happy-dom rejects a cancelled animation's
// `finished` unhandled, where browsers mark it handled.
process.on('unhandledRejection', (reason) => console.error(`[jadis] unhandled rejection in a render: ${reason}`));

const port = parentPort;
const entry: ServerEntry = await import(pathToFileURL(workerData.entryFile).href);
const render = entry.render;
if (!port || typeof render !== 'function') {
  throw new Error(`[jadis] the server entry ${workerData.entryFile} exports no render function`);
}

const send = (message: WorkerMessage): void => port.postMessage(message);
const describe = (error: unknown): string =>
  error instanceof Error ? (error.stack ?? error.message) : String(error);

port.on('message', async ({ id, job }: { id: number; job: RenderJob }) => {
  try {
    const response = await render(job.url, job.request, { fetch: nodeFetch, origin: job.origin });
    send({ id, kind: 'done', response });
  } catch (error) {
    send({ error: describe(error), id, kind: 'failed' });
  } finally {
    releaseDocumentCaches();
  }
});
send({ kind: 'ready' });
