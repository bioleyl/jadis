import type { Deferred } from '../types/connection.type';

/**
 * The `onConnect` calls scheduled and not yet made, over every component, with the first `onRoute` the router owes a
 * page it showed, and those waiting for none to be left (`Jadis.settled()`).
 */
const connections: { pending: number; waiters: Array<() => void> } = { pending: 0, waiters: [] };

/** Counts an `onConnect` scheduled for the task after a connection. */
export function onConnectScheduled(): void {
  connections.pending += 1;
}

/**
 * Counts that task as run, with or without its `onConnect`. Called once that `onConnect` has returned: the components
 * it connected are counted already, so the waiters hear only when theirs have run too.
 */
export function onConnectEnded(): void {
  connections.pending -= 1;
  if (connections.pending > 0) {
    return;
  }
  const waiters = connections.waiters;
  connections.waiters = [];
  for (const resolve of waiters) {
    resolve();
  }
}

/** Resolves once no `onConnect` is left to call: at once when none is. */
export function connectionsSettled(): Promise<void> {
  return connections.pending === 0
    ? Promise.resolve()
    : new Promise((resolve) => {
        connections.waiters.push(resolve);
      });
}

/** A promise with the function that resolves it (`Promise.withResolvers`, which the build's target lacks). */
export function deferred(): Deferred {
  const resolvers: Array<() => void> = [];
  const promise = new Promise<void>((resolve) => {
    resolvers.push(resolve);
  });
  return { promise, resolve: () => resolvers[0]() };
}
