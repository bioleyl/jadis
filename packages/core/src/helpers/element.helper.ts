import { toKebabCase } from './string.helper';

export function createElement<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  attributes: Record<string, string>,
  appendTo?: HTMLElement | ShadowRoot
): HTMLElementTagNameMap[Tag];
export function createElement<T extends HTMLElement>(
  tag: string,
  attributes?: Record<string, string>,
  appendTo?: HTMLElement | ShadowRoot
): T;
export function createElement(
  tag: string,
  attributes: Record<string, string> = {},
  appendTo?: HTMLElement | ShadowRoot
): HTMLElement {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) =>
    el.setAttribute(toKebabCase(key), value)
  );
  appendTo?.appendChild(el);
  return el;
}
