/** biome-ignore-all lint/complexity/noThisInStatic: I explicitly need to refer to "this" and not Jadis for code hint when creating components */
import { assert } from './helpers/assert.helper';
import { ChangeHandler } from './helpers/change.helper';
import { createElement } from './helpers/element.helper';

import type { Bus } from './helpers/bus.helper';
import type {
  ComponentSelector,
  Constructor,
  ElementValues,
  OptionalIfUndefined,
  OptionsWithProps,
  Primitive,
  SelectorToElementWithFallback,
} from './helpers/type.helper.ts';
import type { ChangeOptions, UseEventsHandler } from './types/jadis.type';

export interface JadisConstructor<T extends Jadis = Jadis> {
  new (): T;
  readonly selector: ComponentSelector;
  readonly observedAttributes: Array<string>;
}

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

  protected readonly attributesCallback: Partial<Record<string, (value: string, oldValue: string) => void>> = {};

  /** Actions to perform when the component is connected to the DOM. */
  protected onConnectActions: Array<() => void> = [];

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
   * Creates a new instance with the defined children
   * @param options An optional set of properties and attributes to set on the component {attrs: {}, props: {}}
   * @param slotted The DOM to slot inside the component
   * @returns The created component instance
   */
  static toTemplate<T extends Jadis>(
    this: JadisConstructor<T>,
    options: OptionsWithProps<ElementValues<T>> = {},
    slotted: DocumentFragment = document.createDocumentFragment()
  ): T {
    const element = createElement(this.selector, options);
    element.appendChild(slotted.cloneNode(true));
    return element;
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

  static toString(): string {
    return this.selector;
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
    this.onConnectActions.forEach((fn) => {
      fn();
    });
    setTimeout(() => this.onConnect?.());
  }

  disconnectedCallback(): void {
    this._abortController.abort();
    this.onDisconnect?.();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
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
  protected getElement<Element extends HTMLElement, Tag extends keyof HTMLElementTagNameMap | string = string>(
    query: Tag
  ): SelectorToElementWithFallback<Tag, Element> {
    const el = query.split('>>>').reduce((nextEl: HTMLElement, nextQuery: string) => {
      const found = (nextEl.shadowRoot ?? nextEl).querySelector<HTMLElement>(nextQuery);
      assert(found, `Jadis.getElement: ${nextQuery} element is not reachable`);
      return found;
    }, this);
    assert(el, `${query} element is not reachable`);

    return el as SelectorToElementWithFallback<Tag, Element>;
  }

  /**
   * Toggles a class on the component based on a condition.
   * If the condition is true, the class will be added; if false, it will be removed.
   * @param className The name of the class to toggle
   * @param condition The binary condition to determine whether to add or remove the class
   */
  protected toggleClass(className: string, condition: boolean): void {
    this.classList[condition ? 'add' : 'remove'](className);
  }

  /**
   * Registers a callback for a specific event on a bus.
   * @param bus The event bus to register the callback on
   * @param eventName The event name to listen to
   * @param callback The callback to invoke when the event is emitted
   */
  protected onBus<BusType, BusEventKey extends keyof BusType>(
    bus: Bus<BusType>,
    eventName: BusEventKey,
    callback: (detail: Primitive<BusType[BusEventKey]>) => void
  ): void {
    bus.register(eventName, callback, this.killSignal);
  }

  /**
   * Creates a handler for events on the component.
   * This handler allows registering and emitting events in a type-safe manner.
   * @template EventTypes The type of events to handle
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
  protected useEvents<EventTypes>(
    _schema?: {
      [EventName in keyof EventTypes]: Constructor<EventTypes[EventName]> | undefined;
    }
  ): Readonly<UseEventsHandler<EventTypes>> {
    return Object.freeze({
      emit: <EventName extends keyof EventTypes>(
        eventName: EventName,
        ...params: OptionalIfUndefined<Primitive<EventTypes[EventName]>>
      ): void => {
        this.dispatchEvent(new CustomEvent(eventName as string, { detail: params[0] }));
      },
      register: <EventName extends keyof EventTypes>(
        eventName: EventName,
        callback: (detail: Primitive<EventTypes[EventName]>) => void
      ): void => {
        const listener = ({ detail }: CustomEvent<Primitive<EventTypes[EventName]>>) => callback(detail);
        this.addEventListener(eventName as string, listener as EventListener, {
          signal: this.killSignal,
        });
      },
    });
  }

  /**
   * Registers a callback for a specific event on an element.
   * @param element The element to listen for events on
   * @param eventName The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   */
  protected on<Element extends HTMLElement, EventName extends keyof HTMLElementEventMap>(
    element: Element,
    eventName: EventName,
    callback: (event: HTMLElementEventMap[EventName]) => void
  ): void {
    element.addEventListener(eventName as string, callback as EventListener, {
      signal: this.killSignal,
    });
  }

  /**
   * Creates references to elements within the component's template.
   * This method allows you to define a mapping of element names to query selectors,
   * and it will return an object with getters for each element.
   * @template ElementMap A record mapping element names to their corresponding HTMLElement types
   * @param mapFn A function that takes a ref function and returns a mapping of element names to query selectors
   * @returns An object with getters for each referenced element
   * @throws Will throw an error if the element is not found
   * @example
   * const refs = this.useRefs((ref) => ({
   *   button: ref('button'),
   *   input: ref<HTMLInputElement>('input.my-input'),
   * }));
   *
   * // Usage:
   * refs.button.addEventListener('click', () => { ... });
   */
  protected useRefs<ElementMap extends Record<string, HTMLElement>>(
    mapFn: (
      ref: <Element extends HTMLElement = HTMLElement, Tag extends keyof HTMLElementTagNameMap | string = string>(
        query: Tag
      ) => SelectorToElementWithFallback<Tag, Element>
    ) => ElementMap
  ): Readonly<ElementMap> {
    // Call mapFn with a dummy ref that just returns the query string
    // This allows us to extract the structure of the queries
    const structure = mapFn(
      <Element extends HTMLElement, Tag extends keyof HTMLElementTagNameMap | string = string>(query: Tag) =>
        query as unknown as Element
    );

    return Object.freeze(
      Object.entries(structure).reduce((acc, [key, query]) => {
        Object.defineProperty(acc, key as keyof ElementMap, {
          configurable: false,
          enumerable: true,
          get: () => this.getElement(query as unknown as string),
        });
        return acc;
      }, {} as ElementMap)
    );
  }

  /**
   * Creates a change handler variable.
   * @param initialValue The initial value of the change handler variable
   * @param onChange A callback function that is called when the change handler variable changes
   * @param options Optional configuration for the change handler
   * @returns An object with `get` and `set` methods for the change handler variable
   */
  protected useChange<T>(
    initialValue: T,
    onChange: (newValue: T, oldValue: T) => void,
    { immediate = false }: ChangeOptions = {}
  ): Readonly<ChangeHandler<T>> {
    if (immediate) {
      if (this._isConnected) {
        onChange(initialValue, initialValue);
      } else {
        this.onConnectActions.push(() => {
          onChange(initialValue, initialValue);
        });
      }
    }
    return new ChangeHandler<T>(initialValue, onChange);
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
}
