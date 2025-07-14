import { assert } from './helpers/assert.helper';
import { Bus } from './helpers/bus.helper';
import { createElement } from './helpers/element.helper';
import { html } from './helpers/template.helper';
import type {
  OptionalIfUndefined,
  Primitive,
  Constructor,
} from './helpers/type.helper.ts';

interface JadisConstructor {
  new (): Jadis;
  readonly selector: `${string}-${string}`;
  readonly template: string;
  readonly style: string;
  readonly observedAttributes: Array<string>;
}

type InferAttributes<T> = T extends (infer U)[] ? U : never;

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

  static register(): void {
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

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    this.attributesCallback[name]?.(newValue, oldValue);
  }

  protected get killSignal(): AbortSignal {
    return this._abortController.signal;
  }

  protected getElement<Element extends HTMLElement>(query: string): Element {
    const el = query
      .split('>>>')
      .reduce((nextEl: HTMLElement, nextQuery: string) => {
        return (nextEl.shadowRoot ?? nextEl).querySelector<Element>(nextQuery)!;
      }, this);
    assert(el, `${query} element is not reachable`);

    return el as Element;
  }

  protected toggleClass(className: string, condition: boolean): void {
    condition
      ? this.classList.add(className)
      : this.classList.remove(className);
  }

  protected onBus<BusType, BusEventKey extends keyof BusType>(
    bus: Bus<BusType>,
    event: BusEventKey,
    callback: (detail: Primitive<BusType[BusEventKey]>) => void
  ): void {
    bus.register(event, callback, this.killSignal);
  }

  protected useEvents<EventType>(_schema?: {
    [EventKey in keyof EventType]: Constructor<EventType[EventKey]> | undefined;
  }): {
    register: <EventKey extends keyof EventType>(
      event: EventKey,
      callback: (detail: Primitive<EventType[EventKey]>) => void
    ) => void;
    emit: <EventKey extends keyof EventType>(
      event: EventKey,
      ...params: OptionalIfUndefined<Primitive<EventType[EventKey]>>
    ) => void;
  } {
    return {
      register: <EventKey extends keyof EventType>(
        event: EventKey,
        callback: (detail: Primitive<EventType[EventKey]>) => void
      ): void => {
        const listener = ({
          detail,
        }: CustomEvent<Primitive<EventType[EventKey]>>) => callback(detail);
        this.addEventListener(event as string, listener as EventListener, {
          signal: this.killSignal,
        });
      },
      emit: <EventKey extends keyof EventType>(
        event: EventKey,
        ...params: OptionalIfUndefined<Primitive<EventType[EventKey]>>
      ): void => {
        this.dispatchEvent(
          new CustomEvent(event as string, { detail: params[0] })
        );
      },
    };
  }

  protected on<
    Element extends HTMLElement,
    Event extends keyof HTMLElementEventMap,
  >(
    element: Element,
    event: Event,
    callback: (event: HTMLElementEventMap[Event]) => void
  ): void {
    element.addEventListener(event as string, callback as EventListener, {
      signal: this.killSignal,
    });
  }

  private buildTemplate(): HTMLTemplateElement {
    const template = document.createElement('template');
    template.innerHTML = html`<style>${this.typeOfConstructor.style}</style>${this.typeOfConstructor.template}`;
    return template;
  }

  private static get typeOfClass(): JadisConstructor {
    return this.prototype.constructor as JadisConstructor;
  }

  private get typeOfConstructor(): JadisConstructor {
    return this.constructor as JadisConstructor;
  }
}
