import { applyElementAttributes, applyElementProperty, setElementAttribute } from './element.helper';

import type { Jadis, JadisConstructor } from '../base-component';
import type { AppendableElement, Callable, ComponentEventProps, SafeElementValues } from './type.helper';

// ---------------------------------------------------------------------------
// Fragment
// ---------------------------------------------------------------------------

/** Fragment factory — used for `<></>` syntax. */
export const Fragment = Symbol('JadisFragment');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toClassName(value: string | number | boolean): string {
  return String(value).trim();
}

/**
 * Appends a JSX child to its parent: a node, a string or a number as text, or an array of them, flattened in order;
 * null, undefined and booleans add nothing. Nothing is collected on the way, as each element of a list is made.
 */
function appendChild(parent: Node, child: unknown): void {
  if (child == null || typeof child === 'boolean') {
    return;
  }
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
    return;
  }
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }
  if (Array.isArray(child)) {
    for (const item of child) {
      appendChild(parent, item);
    }
  }
}

const RESERVED_PROPS = new Set(['key', 'class', 'className', 'attrs', 'props', 'children']);

// ---------------------------------------------------------------------------
// VNode types
// ---------------------------------------------------------------------------

/** A virtual node representing an element before it's attached to the DOM. */
export interface VNode {
  /** Tag name string ('div', 'span') or Jadis component constructor */
  tag: string | JadisConstructor;
  /** Resolved props — all values are set before mounting begins */
  props: Record<string, unknown>;
  /** Child vnodes (flat array) — may contain primitives for SSR/mount flexibility */
  children: Array<Node | VNode | string | number>;
}

// ---------------------------------------------------------------------------
// JSX type declarations
// ---------------------------------------------------------------------------

type BaseProps = {
  key?: string | number;
  class?: string;
  className?: string;
  attrs?: Record<string, string>;
  props?: Record<string, unknown>;
  children?: unknown;
};

type CommonJsxAttributes = {
  id?: string;
  class?: string;
  className?: string;
  title?: string;
  role?: string;
  slot?: string;
  style?: string;
  tabIndex?: number;
  [key: `data-${string}`]: string | number | boolean | undefined;
  [key: `aria-${string}`]: string | number | boolean | undefined;
};

type JadisProps = BaseProps & Record<string, unknown>;
type JsxEventHandler = (event: Event) => void;
type JsxEventProps = {
  [key: `on${string}`]: JsxEventHandler | undefined;
};
type IntrinsicElementProps<Tag extends keyof HTMLElementTagNameMap> = BaseProps &
  Omit<Partial<SafeElementValues<HTMLElementTagNameMap[Tag]>>, 'children' | 'style'> &
  CommonJsxAttributes &
  JsxEventProps;
export type IntrinsicElements = {
  [Tag in keyof HTMLElementTagNameMap]: IntrinsicElementProps<Tag>;
} & {
  [elementName: `${string}-${string}`]: JadisProps;
};

type ComponentProps<T extends Jadis> = Omit<SafeElementValues<T>, 'children'> & BaseProps & ComponentEventProps<T>;

/**
 * Common JSX type definitions for Jadis components.
 *
 * Recommended consumer tsconfig:
 * ```json
 * {
 *   "compilerOptions": {
 *     "jsx": "react-jsx",
 *     "jsxImportSource": "@jadis/core"
 *   }
 * }
 * ```
 */
// biome-ignore lint/style/useNamingConvention: JSX is a reserved namespace name
export declare namespace JSX {
  // All Jadis subclasses are valid JSX element classes
  interface ElementClass extends Jadis {}
  // Points to static __jadisProps on the constructor for attribute type inference
  interface ElementAttributesProperty {
    // biome-ignore lint/suspicious/noExplicitAny: TypeScript JSX requires an open attribute marker
    __jadisProps: any;
  }
  // biome-ignore lint/suspicious/noExplicitAny: JSX.Element must be any per JSX spec
  type Element = any;
  interface ElementChildrenAttribute {
    children: unknown;
  }
  interface IntrinsicAttributes {
    key?: string | number;
    id?: string;
    class?: string;
    className?: string;
    title?: string;
    role?: string;
    slot?: string;
    style?: string;
    tabIndex?: number;
    [key: `data-${string}`]: string | number | boolean | undefined;
    [key: `aria-${string}`]: string | number | boolean | undefined;
  }
  // Standard HTML elements use element-specific properties. Hyphenated custom
  // elements remain open for attributes passed to registered web components.
  type IntrinsicElements = import('./jsx-runtime').IntrinsicElements;
}

// Global JSX namespace — needed for `react-jsx` transform
declare global {
  // biome-ignore lint/style/useNamingConvention: JSX is a reserved namespace name
  namespace JSX {
    interface ElementClass extends Jadis {}
    interface ElementAttributesProperty {
      // biome-ignore lint/suspicious/noExplicitAny: TypeScript JSX requires an open attribute marker
      __jadisProps: any;
    }
    // biome-ignore lint/suspicious/noExplicitAny: JSX.Element must be any per JSX spec
    type Element = any;
    interface ElementChildrenAttribute {
      children: unknown;
    }
    interface IntrinsicAttributes {
      key?: string | number;
      id?: string;
      class?: string;
      className?: string;
      title?: string;
      role?: string;
      slot?: string;
      style?: string;
      tabIndex?: number;
      [key: `data-${string}`]: string | number | boolean | undefined;
      [key: `aria-${string}`]: string | number | boolean | undefined;
    }
    // Standard HTML elements use element-specific properties. Hyphenated custom
    // elements remain open for attributes passed to registered web components.
    type IntrinsicElements = import('./jsx-runtime').IntrinsicElements;
  }
}

// ---------------------------------------------------------------------------
// jsx / jsxs / h — runtime
// ---------------------------------------------------------------------------

/**
 * The listener of a component's `on…` prop: a component's own events (`useEvents`) are custom events, whose handler
 * gets the detail, as `events.register` gives it; any other event is given as it is.
 * It is added without the kill signal, so it lasts as long as the element.
 */
function detailListener(handler: Callable): EventListener {
  return (event) => handler(event instanceof CustomEvent ? event.detail : event);
}

/**
 * The event a component's `on…` prop listens to: its name with the first letter in lower case, the rest as written,
 * so `onValueChange` hears `valueChange`, and the DOM property `onclick` still hears `click`.
 */
function componentEventName(prop: string): string {
  return `${prop.charAt(2).toLowerCase()}${prop.slice(3)}`;
}

function createJsxNode(
  type: string | JadisConstructor,
  props: JadisProps | null | undefined,
  children: unknown[]
): Node {
  const content = children.length > 0 ? children : props?.children;

  if (Object.is(type, Fragment)) {
    const fragment = document.createDocumentFragment();
    appendChild(fragment, content);
    return fragment;
  }

  const isComponent = typeof type !== 'string';
  const el: HTMLElement | Jadis = isComponent ? new type() : document.createElement(type);
  if (props) {
    applyProps(el, props, isComponent);
  }
  appendChild(el, content);
  return el;
}

/**
 * Applies an element's JSX props: its attributes, its class, then each other prop, a key given in `props={…}` too
 * taking that value, once.
 */
function applyProps(el: HTMLElement, props: JadisProps, isComponent: boolean): void {
  if (props.attrs) {
    applyElementAttributes(el, props.attrs);
  }
  const className = props.className || props.class;
  if (className) {
    el.setAttribute('class', toClassName(className));
  }

  const explicit = props.props;
  for (const key of Object.keys(props)) {
    if (RESERVED_PROPS.has(key)) {
      continue;
    }
    applyProp(el, key, explicit && Object.hasOwn(explicit, key) ? explicit[key] : props[key], isComponent);
  }
  if (!explicit) {
    return;
  }
  for (const key of Object.keys(explicit)) {
    if (RESERVED_PROPS.has(key) || !Object.hasOwn(props, key)) {
      applyProp(el, key, explicit[key], isComponent);
    }
  }
}

/** Applies one prop: a hyphenated name as an attribute, `on…` as a listener, any other as a property. */
function applyProp(el: HTMLElement, key: string, value: unknown, isComponent: boolean): void {
  if (value === undefined) {
    return;
  }
  if (key.includes('-')) {
    setElementAttribute(el, key, value);
    return;
  }
  if (typeof value === 'function' && key.startsWith('on')) {
    if (isComponent) {
      el.addEventListener(componentEventName(key), detailListener(value as Callable));
    } else {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    }
    return;
  }
  applyElementProperty(el, key, value);
}

/**
 * Factory function used by classic JSX mode (`jsxFactory: "jsx"`).
 * Called as `jsx(type, props, ...children)` for each JSX element.
 */
export function jsx(type: string, props: JadisProps | null | undefined, ...children: unknown[]): Node;
export function jsx<T extends Jadis>(
  type: JadisConstructor<T>,
  props: (ComponentProps<T> & CommonJsxAttributes) | null | undefined,
  ...children: unknown[]
): Node;
export function jsx(
  type: string | JadisConstructor,
  props: JadisProps | null | undefined,
  ...children: unknown[]
): Node {
  return createJsxNode(type, props, children);
}

/** Alias used by TS JSX transforms that emit `jsxs` for grouped children. */
export function jsxs(type: string, props: JadisProps | null | undefined, ...children: unknown[]): Node;
export function jsxs<T extends Jadis>(
  type: JadisConstructor<T>,
  props: (ComponentProps<T> & CommonJsxAttributes) | null | undefined,
  ...children: unknown[]
): Node;
export function jsxs(
  type: string | JadisConstructor,
  props: JadisProps | null | undefined,
  ...children: unknown[]
): Node {
  return createJsxNode(type, props, children);
}

/** Optional alias for users who prefer `jsxFactory: "h"`. */
export const h: typeof jsx = jsx;

// ---------------------------------------------------------------------------
// VNode creation
// ---------------------------------------------------------------------------

/**
 * Create a VNode for an intrinsic HTML element or custom component.
 * @param tag Tag name string ('div', 'span') or Jadis component constructor
 * @param options Optional object with `props` and/or `children`
 */
export function createVNode(
  tag: string | JadisConstructor,
  options?: { props?: Record<string, unknown>; children?: unknown[] }
): VNode {
  return {
    children: resolveVNodeChildren(options?.children ?? []),
    props: options?.props ?? {},
    tag,
  };
}

/** Create a VNode for a Jadis component class. */
export function createComponentVNode<T extends Jadis>(
  Component: JadisConstructor<T>,
  options?: { props?: Record<string, unknown>; children?: unknown[] }
): VNode {
  return {
    children: resolveVNodeChildren(options?.children ?? []),
    props: options?.props ?? {},
    tag: Component,
  };
}

// ---------------------------------------------------------------------------
// VNode mounting
// ---------------------------------------------------------------------------

function resolveVNodeChildren(children: unknown[]): Array<Node | VNode | string | number> {
  const result: Array<Node | VNode | string | number> = [];
  for (const child of children) {
    if (child == null || typeof child === 'boolean') {
      continue;
    }

    if (typeof child === 'string' || typeof child === 'number') {
      result.push(child);
    } else if (child instanceof Node) {
      result.push(child);
    } else if (Array.isArray(child)) {
      for (const item of child) {
        const resolved = resolveVNodeChildren([item]);
        result.push(...resolved);
      }
    } else {
      result.push(child as VNode);
    }
  }
  return result;
}

export function mountVNodes(parent: AppendableElement, children: Array<Node | VNode | string | number>): void {
  for (const child of children) {
    if (child instanceof Node) {
      parent.appendChild(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      parent.appendChild(document.createTextNode(String(child)));
    } else {
      mountSingleVNode(parent, child);
    }
  }
}

function mountSingleVNode(parent: AppendableElement, vnode: VNode): void {
  const { tag, props, children } = vnode;

  if (typeof tag === 'string') {
    // Intrinsic element
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      if (key.includes('-') || key.startsWith('data-') || key.startsWith('aria-')) {
        el.setAttribute(key, String(value));
      } else if (typeof value === 'function' && key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value as EventListener);
      } else {
        (el as unknown as Record<string, unknown>)[key] = value;
      }
    }

    mountVNodes(el, children);
    parent.appendChild(el);
  } else {
    // Jadis component
    const instance = new tag();
    for (const [key, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      if (key === 'className') {
        instance.setAttribute('class', toClassName(String(value)));
      } else if (key === 'class') {
        const propsObj = props as Record<string, unknown>;
        if (!propsObj.className) {
          instance.setAttribute('class', toClassName(String(value)));
        }
      } else if (typeof value === 'function' && key.startsWith('on')) {
        instance.addEventListener(componentEventName(key), detailListener(value as Callable));
      } else if (!RESERVED_PROPS.has(key)) {
        (instance as unknown as Record<string, unknown>)[key] = value;
      }
    }
    mountVNodes(instance, children);
    parent.appendChild(instance);
  }
}
