import { assert } from './helpers/assert.helper';
import { Bus } from './helpers/bus.helper';
import { createElement } from './helpers/element.helper';
import { html } from './helpers/template.helper';
import type {
  OptionalIfUndefined,
  Primitive,
  Constructor,
  ComponentSelector,
} from './helpers/type.helper.ts';
import { UseEventsHandler } from './types/jadis.type';

interface JadisConstructor {
  new (): Jadis;
  readonly selector: ComponentSelector;
  readonly observedAttributes: Array<string>;
}

type InferAttributes<T> = T extends (infer U)[] ? U : never;

/**
 * Base class for all Jadis components.
 * It provides a structure for creating web components with a shadow DOM,
 * event handling, and attribute management.
 */
export abstract class Jadis extends HTMLElement {
  static readonly selector: ComponentSelector;
  static readonly template: string = '';
  static readonly observedAttributes: Array<string> = [];
  readonly shadowRoot: ShadowRoot;

  protected readonly attributesCallback: Partial<
    Record<string, (value: string, oldValue: string) => void>
  > = {};

  private readonly _abortController = new AbortController();

  private _isConnected = false;

  /**
   * Callback invoked when the component is connected to the DOM.
   * This method can be overridden to perform actions when the component is added to the document.
   * This is the place to initialize component state, start any necessary processes and add event listeners.
   */
  onConnect?(): void;
  /**
   * Callback invoked when the component is disconnected from the DOM.
   */
  onDisconnect?(): void;

  /**
   * The HTML template for the component.
   * This method should return a string containing the HTML structure of the component.
   * It can be overridden to provide custom templates.
   * @returns The HTML template as a string
   * @example
   * ```typescript
   * templateHtml() {
   *   return `<div>Hello, World!</div>`;
   * }
   * ```
   */
  templateHtml?(): DocumentFragment;

  /**
   * The CSS styles for the component.
   * This method should return a string containing the CSS styles for the component.
   * It can be overridden to provide custom styles.
   * @returns The CSS styles as a string
   * @example
   * ```typescript
   * templateCss() {
   *   return `:host { display: block; }`;
   * }
   * ```
   */
  templateCss?(): string;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.buildTemplate());
  }

  /**
   * Creates a new instance of the component.
   * @param attributes The attributes to set on the component
   * @param appendTo The element to append the component to
   * @returns The created component instance
   */
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

  /**
   * Registers the component as a custom element.
   * This method should be called once to define the custom element in the browser.
   * It checks if the selector is defined and if the custom element is not already registered.
   * @throws Will throw an error if the selector is not defined for the component
   */
  static register(): void {
    assert(this.selector, `selector is not defined for ${this.name}`);
    if (!customElements.get(this.typeOfClass.selector)) {
      customElements.define(this.typeOfClass.selector, this.typeOfClass);
    }
  }

  /**
   * Checks if the component is connected to the DOM.
   * @returns True if the component is connected, false otherwise
   */
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

  /**
   * Returns the AbortSignal associated with this component.
   * This signal can be used to cancel ongoing operations or event listeners.
   * @returns The AbortSignal for this component
   */
  protected get killSignal(): AbortSignal {
    return this._abortController.signal;
  }

  /**
   * Retrieves an element from the component's template.
   * @param query The query string to find the element
   * @returns The found element
   * @throws Will throw an error if the element is not found
   */
  protected getElement<Element extends HTMLElement>(query: string): Element {
    const el = query
      .split('>>>')
      .reduce((nextEl: HTMLElement, nextQuery: string) => {
        return (nextEl.shadowRoot ?? nextEl).querySelector<Element>(nextQuery)!;
      }, this);
    assert(el, `${query} element is not reachable`);

    return el as Element;
  }

  /**
   * Toggles a class on the component based on a condition.
   * If the condition is true, the class will be added; if false, it will be removed.
   * @param className The name of the class to toggle
   * @param condition The binary condition to determine whether to add or remove the class
   */
  protected toggleClass(className: string, condition: boolean): void {
    condition
      ? this.classList.add(className)
      : this.classList.remove(className);
  }

  /**
   * Registers a callback for a specific event on a bus.
   * @param bus The event bus to register the callback on
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   */
  protected onBus<BusType, BusEventKey extends keyof BusType>(
    bus: Bus<BusType>,
    event: BusEventKey,
    callback: (detail: Primitive<BusType[BusEventKey]>) => void
  ): void {
    bus.register(event, callback, this.killSignal);
  }

  /**
   * Creates a handler for events on the component.
   * This handler allows registering and emitting events in a type-safe manner.
   * @template EventType The type of events to handle
   * @returns An object with methods to register and emit events
   * @example
   * // Typescript usage:
   * const events = this.useEvents<{ someEvent: string }>();
   * events.register('someEvent', (detail) => {
   *   console.log('Event detail:', detail);
   * });
   * events.emit('someEvent', 'Hello World');
   *
   * // Javascript usage:
   * const events = this.useEvents({someEvent: String});
   * events.register('someEvent', (detail) => {
   *   console.log('Event detail:', detail);
   * });
   * events.emit('someEvent', 'Hello World');
   */
  protected useEvents<EventType>(_schema?: {
    [EventKey in keyof EventType]: Constructor<EventType[EventKey]> | undefined;
  }): UseEventsHandler<EventType> {
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

  /**
   * Registers a callback for a specific event on an element.
   * @param element The element to listen for events on
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   */
  protected on<
    Element extends HTMLElement,
    Event extends keyof HTMLElementEventMap
  >(
    element: Element,
    event: Event,
    callback: (event: HTMLElementEventMap[Event]) => void
  ): void {
    element.addEventListener(event as string, callback as EventListener, {
      signal: this.killSignal,
    });
  }

  private buildTemplate(): DocumentFragment {
    const style = document.createElement('style');
    style.textContent = this.templateCss?.() ?? '';

    const fragment = document.createDocumentFragment();
    fragment.appendChild(style);

    const htmlContent = this.templateHtml?.();
    if (htmlContent) {
      fragment.appendChild(htmlContent);
    }

    return fragment;
  }

  private static get typeOfClass(): JadisConstructor {
    return this.prototype.constructor as JadisConstructor;
  }

  private get typeOfConstructor(): JadisConstructor {
    return this.constructor as JadisConstructor;
  }
}
