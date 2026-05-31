import type { EventKey, EventSchema, KeysWithoutUndefined, KeysWithUndefined } from './type.helper';

/**
 * A bus for handling events in a type-safe manner.
 * It allows registering and emitting events with specific types.
 */
export class Bus<T extends Record<string, unknown>> {
  private readonly _domElement = new EventTarget();

  // biome-ignore lint/complexity/noUselessConstructor: Needed in JS for typing if no JSDoc is present
  constructor(_schema?: EventSchema) {} // NOSONAR

  /**
   * Registers a callback for a specific event.
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   * @param signal The AbortSignal to cancel the listener
   */
  register<K extends KeysWithoutUndefined<T>>(
    event: K,
    callback: (detail: T[K]) => void,
    signal: AbortSignal
  ): void;
  register<K extends KeysWithUndefined<T>>(event: K, callback: (detail?: T[K]) => void, signal: AbortSignal): void;
  // biome-ignore lint/suspicious/noExplicitAny: Needed for event listener callback
  register(event: EventKey<T>, callback: (...args: any[]) => void, signal: AbortSignal): void {
    const listener = ({ detail }: CustomEventInit<T[EventKey<T>]>) => callback(detail);

    this._domElement.addEventListener(event, listener, { signal });
  }

  /**
   * Emits an event on the bus.
   * @param event The event key to emit
   * @param params The parameters to include with the event
   */
  emit<K extends KeysWithoutUndefined<T>>(event: K, detail: T[K]): void;
  emit<K extends KeysWithUndefined<T>>(event: K, detail?: T[K]): void;
  emit(event: EventKey<T>, detail?: unknown): void {
    this._domElement.dispatchEvent(new CustomEvent(event, { detail }));
  }
}
