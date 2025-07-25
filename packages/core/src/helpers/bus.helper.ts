import { Constructor, OptionalIfUndefined, Primitive } from './type.helper';

/**
 * A bus for handling events in a type-safe manner.
 * It allows registering and emitting events with specific types.
 */
export class Bus<T> {
  private readonly domElement = document.createElement('div');

  constructor(_schema?: { [K in keyof T]: Constructor<T[K]> | undefined }) {
    // only for typing
  }

  /**
   * Registers a callback for a specific event.
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   * @param signal The AbortSignal to cancel the listener
   */
  register<K extends keyof T>(
    event: K,
    callback: (detail: Primitive<T[K]>) => void,
    signal: AbortSignal
  ): void {
    const listener = ({ detail }: CustomEvent<Primitive<T[K]>>) =>
      callback(detail);
    this.domElement.addEventListener(
      event as string,
      listener as EventListener,
      { signal }
    );
  }

  /**
   * Emits an event on the bus.
   * @param event The event key to emit
   * @param params The parameters to include with the event
   */
  emit<K extends keyof T>(
    event: K,
    ...params: OptionalIfUndefined<Primitive<T[K]>>
  ): void {
    this.domElement.dispatchEvent(
      new CustomEvent(event as string, { detail: params[0] })
    );
  }
}
