import { Constructor, OptionalIfUndefined, Primitive } from './type.helper';

export class Bus<T> {
  private readonly domElement = document.createElement('div');

  constructor(_schema?: { [K in keyof T]: Constructor<T[K]> | undefined }) {
    // only for typing
  }

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

  emit<K extends keyof T>(
    event: K,
    ...params: OptionalIfUndefined<Primitive<T[K]>>
  ): void {
    this.domElement.dispatchEvent(
      new CustomEvent(event as string, { detail: params[0] })
    );
  }
}
