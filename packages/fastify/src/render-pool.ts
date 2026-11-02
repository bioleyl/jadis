import { Worker } from 'node:worker_threads';

import { workerExecArgv } from './worker-options.js';

import type { RenderJob, RenderResult, WorkerMessage } from './types/plugin.type.js';

const WORKER_FILE = new URL('./render-worker.js', import.meta.url);

interface Pending {
  resolve: (result: RenderResult) => void;
  reject: (error: Error) => void;
  /** Fails the render once it took longer than the pool's timeout. */
  timer: NodeJS.Timeout;
}

interface PoolWorker {
  worker: Worker;
  ready: Promise<void>;
  /** Whether the worker loaded the server entry: one that could not keeps failing the renders with its error. */
  started: boolean;
  /** The renders given to the worker, the ones waiting for it to start included. */
  pending: Map<number, Pending>;
}

/** Takes a render off its worker's list, its timer stopped: undefined when it was already answered or failed. */
function takePending(pooled: PoolWorker, id: number): Pending | undefined {
  const job = pooled.pending.get(id);
  pooled.pending.delete(id);
  clearTimeout(job?.timer);
  return job;
}

/** Fails every render a worker holds. */
function failPending(pooled: PoolWorker, error: Error): void {
  for (const job of pooled.pending.values()) {
    clearTimeout(job.timer);
    job.reject(error);
  }
  pooled.pending.clear();
}

/**
 * Worker threads that render pages, each with its own DOM and its own copy of the app's modules: renders run on
 * several cores, and one request's render never shares a document or a module's state with another thread's. A page
 * goes to the worker with the fewest waiting; a worker that fails is replaced. Every render ends: answered, failed
 * with its worker, failed after the timeout, or failed when the pool closes.
 */
export class RenderPool {
  private readonly _workers: PoolWorker[];
  private _nextId = 0;
  private _closing = false;

  /**
   * @param entryFile The app's server entry, built
   * @param size How many workers render at once
   * @param timeout How long a render may take, in milliseconds, from the moment it is asked
   */
  constructor(
    private readonly entryFile: string,
    size: number,
    private readonly timeout: number
  ) {
    this._workers = Array.from({ length: size }, () => this.spawn());
  }

  /**
   * Renders a page on the worker with the fewest renders, counted from the moment they are asked: the renders asked
   * while the workers start spread over them too. One that takes longer than the timeout fails, and its late answer
   * is dropped.
   */
  render(job: RenderJob): Promise<RenderResult> {
    const target = this.leastBusy();
    this._nextId += 1;
    const id = this._nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.expire(target, id, job.url), this.timeout);
      target.pending.set(id, { reject, resolve, timer });
      target.ready.then(
        () => this.send(target, id, job),
        (error: Error) => takePending(target, id)?.reject(error)
      );
    });
  }

  /** Stops the workers, failing the renders they still hold: no request is left waiting for an answer. */
  async close(): Promise<void> {
    this._closing = true;
    const stopped = new Error('[jadis] the render workers stopped before the page was rendered');
    for (const pooled of this._workers) {
      failPending(pooled, stopped);
    }
    await Promise.all(this._workers.map(({ worker }) => worker.terminate()));
  }

  private leastBusy(): PoolWorker {
    return this._workers.reduce((best, candidate) =>
      candidate.pending.size < best.pending.size ? candidate : best
    );
  }

  /** Fails a render that took longer than the timeout: its worker's answer, should it come, is dropped. */
  private expire(target: PoolWorker, id: number, url: string): void {
    takePending(target, id)?.reject(new Error(`[jadis] the render of ${url} took over ${this.timeout} ms`));
  }

  /** Sends a render to its started worker, unless it already failed while the worker started. */
  private send(target: PoolWorker, id: number, job: RenderJob): void {
    if (!target.pending.has(id)) {
      return;
    }
    target.worker.postMessage({ id, job });
  }

  private spawn(): PoolWorker {
    const worker = new Worker(WORKER_FILE, {
      ...workerExecArgv(process.execArgv),
      workerData: { entryFile: this.entryFile },
    });
    const started = Promise.withResolvers<void>();
    const handlers: {
      [Kind in WorkerMessage['kind']]: (message: Extract<WorkerMessage, { kind: Kind }>) => void;
    } = {
      done: ({ id, response, styles }) => takePending(pooled, id)?.resolve({ response, styles }),
      failed: ({ id, error }) => takePending(pooled, id)?.reject(new Error(error)),
      ready: () => {
        pooled.started = true;
        started.resolve();
      },
    };
    const pooled: PoolWorker = { pending: new Map(), ready: started.promise, started: false, worker };
    worker.on('message', (message: WorkerMessage) =>
      (handlers[message.kind] as (message: WorkerMessage) => void)(message)
    );
    worker.on('error', (error) => this.fail(pooled, error, started.reject));
    // A thread that ends without an error (`process.exit()` in the app's code) fails what it held as well. After an
    // error, the exit that follows finds nothing left to fail, and its worker already replaced.
    worker.on('exit', (code) =>
      this.fail(pooled, new Error(`[jadis] a render worker stopped with exit code ${code}`), started.reject)
    );
    // A failed start is reported to the renders waiting for it, not as an unhandled rejection.
    started.promise.catch(() => undefined);
    return pooled;
  }

  /** Fails the renders a worker held, and puts a new worker in the place of one that had started. */
  private fail(pooled: PoolWorker, error: Error, failStart: (error: Error) => void): void {
    failStart(error);
    failPending(pooled, error);
    const index = this._workers.indexOf(pooled);
    if (!this._closing && pooled.started && index !== -1) {
      this._workers[index] = this.spawn();
    }
  }
}
