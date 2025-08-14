import { toKebabCase } from './string.helper';
import { AppendableElement } from './type.helper';

/**
 * Creates a new HTML element.
 * This function allows you to create an HTML element with specified attributes
 * and append it to a specified parent element.
 * @param tag The tag name of the element to create
 * @param attributes The attributes to set on the element
 * @param appendTo The element to append the new element to
 * @returns The created HTML element
 * @example
 * const newElement = createElement('div', { class: 'my-class', id: 'my-id' }, document.body);
 */
export function createElement<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  attributes?: Record<string, string>,
  appendTo?: AppendableElement
): HTMLElementTagNameMap[Tag];
export function createElement<T extends HTMLElement>(
  tag: string,
  attributes?: Record<string, string>,
  appendTo?: AppendableElement
): T;
export function createElement(
  tag: string,
  attributes: Record<string, string> = {},
  appendTo?: AppendableElement
): HTMLElement {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) =>
    el.setAttribute(toKebabCase(key), value)
  );
  appendTo?.appendChild(el);
  return el;
}
