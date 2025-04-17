import { assert } from './helpers/assert.helper';
import { createElement } from './helpers/element.helper';
import type {
  OptionalIfUndefined,
  Primitive,
  Constructor,
} from './helpers/type.helper';

interface JadisConstructor {
  new (): Jadis;
  readonly selector: `${string}-${string}`;
  readonly template: string;
  readonly style: string;
  readonly observedAttributes: string[];
}

type InferAttributes<T> = T extends (infer U)[] ? U : never;

interface GetElementOptions {
  cache: boolean;
}

export abstract class Jadis extends HTMLElement {
  static readonly selector: `${string}-${string}`;
  static readonly template: string = '';
  static readonly style: string = '';
  static readonly observedAttributes: Array<string> = [];
  readonly shadowRoot: ShadowRoot;

  protected readonly attributesCallback: Partial<
    Record<string, (value: string, oldValue: string) => void>
  > = {};

  private readonly _abortController = new AbortController();

  private _isConnected = false;

  onConnect?(): void;
  onDisconnect?(): void;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.buildTemplate().content.cloneNode(true));
  }

  static createElement<T extends JadisConstructor>(
    this: T,
    attributes: Partial<
      Record<InferAttributes<T['observedAttributes']>, string>
    > = {},
    appendTo?: HTMLElement | ShadowRoot
  ): InstanceType<T> {
    return createElement(
      this.selector,
      attributes as Record<string, string>,
      appendTo
    );
  }

  static register() {
    assert(this.selector, `selector is not defined for ${this.name}`);
    if (!customElements.get(this.typeOfClass.selector)) {
      customElements.define(this.typeOfClass.selector, this.typeOfClass);
    }
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  connectedCallback(): void {
    this._isConnected = true;
    setTimeout(() => this.onConnect?.());
  }

  disconnectedCallback(): void {
    this._abortController.abort();
    this.onDisconnect?.();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    this.attributesCallback[name]?.(newValue, oldValue);
  }

  protected get killSignal(): AbortSignal {
    return this._abortController.signal;
  }

  protected getElement<T extends HTMLElement>(
    query: string,
    options: Partial<GetElementOptions> = {}
  ): T {
    const el = query
      .split('>>>')
      .reduce(
        (nextEl: HTMLElement, nextQuery: string) =>
          (nextEl.shadowRoot ?? nextEl).querySelector<T>(nextQuery)!,
        this
      );
    assert(el, `${query} element is not reachable`);

    return el as T;
  }

  protected toggleClass(className: string) {
    return {
      if: (condition: boolean) => {
        condition
          ? this.classList.add(className)
          : this.classList.remove(className);
      },
    };
  }

  protected useEvents<T>(_schema?: {
    [K in keyof T]: Constructor<T[K]> | undefined;
  }) {
    return {
      register: <K extends keyof T>(
        event: K,
        callback: (detail: Primitive<T[K]>) => void
      ): void => {
        const listener = ({ detail }: CustomEvent<Primitive<T[K]>>) =>
          callback(detail);
        this.addEventListener(event as string, listener as EventListener, {
          signal: this.killSignal,
        });
      },
      emit: <K extends keyof T>(
        event: K,
        ...params: OptionalIfUndefined<Primitive<T[K]>>
      ): void => {
        this.dispatchEvent(
          new CustomEvent(event as string, { detail: params[0] })
        );
      },
    };
  }

  protected listenOn<T extends HTMLElement>(element: T) {
    return {
      when: <K extends keyof HTMLElementEventMap>(eventType: K) => {
        return this.registerListener<HTMLElementEventMap, K>(
          element,
          eventType
        );
      },
    };
  }

  private registerListener<EventMap, Key extends keyof EventMap>(
    on: HTMLElement,
    eventType: Key
  ) {
    return {
      do: (callback: (event: EventMap[Key]) => void) => {
        on.addEventListener(eventType as string, callback as EventListener, {
          signal: this.killSignal,
        });
      },
    };
  }

  private buildTemplate() {
    const template = document.createElement('template');
    template.innerHTML = `<style>${this.typeOfConstructor.style}</style>${this.typeOfConstructor.template}`;
    return template;
  }

  private static get typeOfClass(): JadisConstructor {
    return this.prototype.constructor as JadisConstructor;
  }

  private get typeOfConstructor(): JadisConstructor {
    return this.constructor as JadisConstructor;
  }
}
