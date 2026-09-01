import { ChangeHandler } from './change.helper';

import type { Jadis, JadisConstructor } from '../base-component';
import type { AppendableElement, SafeElementValues } from './type.helper';

// ---------------------------------------------------------------------------
// Fragment
// ---------------------------------------------------------------------------

/** Fragment factory — used for `<></>` syntax. */
export const Fragment = Symbol('JadisFragment');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toKebabCase(str: string): string {
  return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? `-${$.toLowerCase()}` : $.toLowerCase()));
}

function toClassName(value: string | number | boolean): string {
  return String(value).trim();
}

/**
 * Resolve JSX children into DOM nodes or text nodes.
 * Handles null, boolean, string, number, Node, Node[], and nested arrays.
 */
function resolveChildren(children: unknown[]): Array<Node | string | number> {
  const result: Array<Node | string | number> = [];

  for (const child of children) {
    if (child == null || typeof child === 'boolean') {
      continue;
    }

    if (typeof child === 'string' || typeof child === 'number') {
      result.push(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      result.push(child);
    } else if (Array.isArray(child)) {
      for (const item of child) {
        const resolved = resolveChildren([item]);
        result.push(...resolved);
      }
    }
  }

  return result;
}

/** Reserved prop keys that are not set directly on the element. */
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

type ComponentProps<T extends Jadis> = SafeElementValues<T> & BaseProps;

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
  interface ElementClass extends Jadis {}
  interface ElementAttributesProperty {
    __jadisProps: unknown;
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
  interface IntrinsicElements {
    [elementName: string]: JadisProps;
  }
}

// Global JSX namespace — needed for `react-jsx` transform
declare global {
  // biome-ignore lint/style/useNamingConvention: JSX is a reserved namespace name
  namespace JSX {
    interface ElementClass extends Jadis {}
    interface ElementAttributesProperty {
      __jadisProps: unknown;
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
    interface IntrinsicElements {
      [elementName: string]: JadisProps;
    }
  }
}

// ---------------------------------------------------------------------------
// jsx / jsxs / h — runtime
// ---------------------------------------------------------------------------

function createJsxNode(
  type: string | JadisConstructor,
  props: JadisProps | null | undefined,
  children: unknown[]
): Node {
  const normalizedChildren =
    children.length > 0 ? children : props?.children === undefined ? [] : [props.children];

  const resolved = resolveChildren(normalizedChildren);

  // Fragment: return a DocumentFragment with all resolved children
  if (Object.is(type, Fragment)) {
    const frag = document.createDocumentFragment();
    for (const child of resolved) {
      if (child instanceof Node) {
        frag.appendChild(child);
      }
    }
    return frag;
  }

  // Create element or component instance
  let el: HTMLElement | Jadis;
  if (typeof type === 'string') {
    el = document.createElement(type);
  } else {
    el = new type();
  }

  // Set attrs
  const attrs = props?.attrs ?? {};
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(toKebabCase(key), String(value));
  }

  // Separate reserved vs direct props
  const directProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props ?? {})) {
    if (!RESERVED_PROPS.has(key)) {
      directProps[key] = value;
    }
  }

  // Set className / class → class attribute
  if (props?.className) {
    el.setAttribute('class', toClassName(props.className));
  } else if (props?.class) {
    el.setAttribute('class', toClassName(props.class));
  }

  // Merge direct props with explicit props object
  const ownProps = { ...directProps, ...(props?.props ?? {}) };

  for (const [key, value] of Object.entries(ownProps)) {
    if (value === undefined) {
      continue;
    }

    const target = el;
    const currentValue = target[key as keyof typeof target];

    if (currentValue instanceof ChangeHandler) {
      currentValue.set(value as Parameters<ChangeHandler<unknown>['set']>[0]);
      continue;
    }

    if (key.includes('-') || key.startsWith('data-') || key.startsWith('aria-')) {
      el.setAttribute(key, String(value));
      continue;
    }

    if (typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value as EventListener);
    } else {
      (target as unknown as Record<string, unknown>)[key] = value;
    }
  }

  // Append children
  for (const child of resolved) {
    if (child instanceof Node) {
      el.appendChild(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      const textNode = document.createTextNode(String(child));
      el.appendChild(textNode);
    }
  }

  return el;
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
      } else if (typeof value === 'function') {
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
      } else if (typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        instance.addEventListener(eventName, value as EventListener);
      } else if (!RESERVED_PROPS.has(key)) {
        (instance as unknown as Record<string, unknown>)[key] = value;
      }
    }
    mountVNodes(instance.shadowRoot ?? instance, children);
  }
}

// ---------------------------------------------------------------------------
// SSR helpers
// ---------------------------------------------------------------------------

function escapeHtml(value: string | number | boolean): string {
  const str = String(value ?? '');
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function attrName(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function fragmentToString(fragment: Node): string {
  const template = document.createElement('template');
  template.content.appendChild(fragment.cloneNode(true));
  return template.innerHTML;
}

/**
 * Render a VNode tree into an HTML string. Used by SSR only.
 *
 * For custom components with shadow DOM, outputs:
 *   `<component-tag props...></component-tag>`
 *   `<template shadowrootmode="open" shadowrootserializable="true">...</template>`
 *
 * The browser parses the template content into a real ShadowRoot during hydration.
 */
export function renderToString(vnodes: Array<Node | VNode | string | number>): string {
  const parts: string[] = [];
  for (const child of vnodes) {
    if (child instanceof Node) {
      continue;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      parts.push(escapeHtml(child));
    } else {
      renderVNodeToString(parts, child);
    }
  }
  return parts.join('');
}

function renderVNodeToString(out: string[], vnode: VNode): void {
  const { tag, props, children } = vnode;

  if (typeof tag === 'string') {
    // Intrinsic element
    out.push(`<${tag}`);
    for (const [key, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      const attr = attrName(key);
      if (typeof value === 'boolean') {
        if (value) {
          out.push(` ${attr}`);
        }
      } else {
        out.push(` ${attr}="${escapeHtml(String(value))}"`);
      }
    }
    const voidElements = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
    if (voidElements.has(tag)) {
      out.push('/>');
      return;
    }
    out.push('>');
    for (const child of children) {
      if (child instanceof Node) {
        continue;
      }
      if (typeof child === 'string' || typeof child === 'number') {
        out.push(escapeHtml(child));
      } else {
        renderVNodeToString(out, child);
      }
    }
    out.push(`</${tag}>`);
  } else {
    // Jadis component
    const Component = tag;
    const selector =
      (Component.prototype.constructor as JadisConstructor).selector
      ?? (Component as JadisConstructor).selector
      ?? 'jadis-component';
    out.push(`<${selector}`);
    for (const [key, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      const attr = attrName(key);
      if (typeof value === 'boolean') {
        if (value) {
          out.push(` ${attr}`);
        }
      } else {
        out.push(` ${attr}="${escapeHtml(String(value))}"`);
      }
    }
    const voidElements = new Set(['input', 'br', 'hr']);
    if (voidElements.has(selector)) {
      out.push('/>');
      return;
    }
    out.push('>');
    // Render shadow DOM content
    const instance = new Component();
    for (const [key, value] of Object.entries(props)) {
      if (value == null) {
        continue;
      }
      if (!['key', 'class', 'className'].includes(key)) {
        (instance as unknown as Record<string, unknown>)[key] = value;
      }
    }
    const fragment = instance.templateHtml?.();
    if (fragment) {
      out.push('<template shadowrootmode="open" shadowrootserializable="true">');
      out.push(fragmentToString(fragment));
      out.push('</template>');
    }
    out.push(`</${selector}>`);
  }
}

/**
 * Hydrate SSR-rendered components.
 *
 * For each custom element that contains a <template shadowrootmode="open">
 * child, calls attachShadow() and the browser automatically moves the template
 * content into the new ShadowRoot (it disappears from light DOM).
 *
 * @param root - The document or element to search within.
 */
export function hydrateSSR(root: Document | Element = globalThis.document as Document): void {
  const templates = Array.from(root.querySelectorAll('template[shadowrootmode]'));
  for (const tmpl of templates) {
    const hostEl = tmpl.parentElement;
    if (!hostEl || !(hostEl instanceof HTMLElement)) {
      continue;
    }
    if (hostEl.shadowRoot !== null) {
      continue;
    }
    try {
      hostEl.attachShadow({ mode: 'open' });
    } catch {
      // Shadow DOM may already be attached by another hydrator
    }
  }
}
