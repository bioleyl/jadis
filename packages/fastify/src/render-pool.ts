import { Worker } from 'node:worker_threads';

import { workerExecArgv } from './worker-options.js';

import type { PageResponse, RenderJob, WorkerMessage } from './types/plugin.type.js';

const WORKER_FILE = new URL('./render-worker.js', import.meta.url);

interface Pending {
  resolve: (response: PageResponse) => void;
  reject: (error: Error) => void;
}

interface PoolWorker {
  worker: Worker;
  ready: Promise<void>;
  /** Whether the worker loaded the server entry: one that could not keeps failing the renders with its error. */
  started: boolean;
  pending: Map<number, Pending>;
}

/**
 * Worker threads that render pages, each with its own DOM and its own copy of the app's modules: renders run on
 * several cores, and one request's render never shares a document or a module's state with another thread's. A page
 * goes to the worker with the fewest waiting; a worker that fails is replaced.
 */
export class RenderPool {
  private readonly _workers: PoolWorker[];
  private _nextId = 0;
  private _closing = false;

  constructor(
    private readonly entryFile: string,
    size: number
  ) {
    this._workers = Array.from({ length: size }, () => this.spawn());
  }

  async render(job: RenderJob): Promise<PageResponse> {
    const target = this.leastBusy();
    await target.ready;
    this._nextId += 1;
    const id = this._nextId;
    return new Promise((resolve, reject) => {
      target.pending.set(id, { reject, resolve });
      target.worker.postMessage({ id, job });
    });
  }

  async close(): Promise<void> {
    this._closing = true;
    await Promise.all(this._workers.map(({ worker }) => worker.terminate()));
  }

  private leastBusy(): PoolWorker {
    return this._workers.reduce((best, candidate) =>
      candidate.pending.size < best.pending.size ? candidate : best
    );
  }

  private spawn(): PoolWorker {
    const worker = new Worker(WORKER_FILE, {
      ...workerExecArgv(process.execArgv),
      workerData: { entryFile: this.entryFile },
    });
    const pending = new Map<number, Pending>();
    const started = Promise.withResolvers<void>();
    const handlers: {
      [Kind in WorkerMessage['kind']]: (message: Extract<WorkerMessage, { kind: Kind }>) => void;
    } = {
      done: ({ id, response }) => settle(id)?.resolve(response),
      failed: ({ id, error }) => settle(id)?.reject(new Error(error)),
      ready: () => {
        pooled.started = true;
        started.resolve();
      },
    };
    const settle = (id: number): Pending | undefined => {
      const job = pending.get(id);
      pending.delete(id);
      return job;
    };
    const pooled: PoolWorker = { pending, ready: started.promise, started: false, worker };
    worker.on('message', (message: WorkerMessage) =>
      (handlers[message.kind] as (message: WorkerMessage) => void)(message)
    );
    worker.on('error', (error) => this.fail(pooled, error, started.reject));
    // A failed start is reported to the renders waiting for it, not as an unhandled rejection.
    started.promise.catch(() => undefined);
    return pooled;
  }

  /** Fails the renders a worker held, and puts a new worker in the place of one that had started. */
  private fail(pooled: PoolWorker, error: Error, failStart: (error: Error) => void): void {
    failStart(error);
    for (const job of pooled.pending.values()) {
      job.reject(error);
    }
    pooled.pending.clear();
    const index = this._workers.indexOf(pooled);
    if (!this._closing && pooled.started && index !== -1) {
      this._workers[index] = this.spawn();
    }
  }
}
