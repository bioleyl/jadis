import { toKebabCase } from './string.helper';

import type { JadisConstructor } from '../base-component';
import type { AppendableElement, ElementAttributes } from './type.helper';

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
  attributes?: ElementAttributes<HTMLElementTagNameMap[Tag]>,
  appendTo?: AppendableElement
): HTMLElementTagNameMap[Tag];
export function createElement<T extends HTMLElement>(
  tag: string,
  attributes?: ElementAttributes<T>,
  appendTo?: AppendableElement
): T;
export function createElement<T extends JadisConstructor>(
  tag: T,
  attributes?: ElementAttributes<InstanceType<T>>,
  appendTo?: AppendableElement
): InstanceType<T>;
export function createElement(
  tag: string,
  attributes: Record<string, unknown> = {},
  appendTo?: AppendableElement
): HTMLElement {
  const el = document.createElement(tag.toString());
  Object.entries(attributes).forEach(([key, value]) => {
    // If the property exists on the element, set it directly
    if (key in el && key !== 'class') {
      (el as HTMLElement & Record<string, unknown>)[key] = value;
    } else {
      el.setAttribute(toKebabCase(key), String(value));
    }
  });
  appendTo?.appendChild(el);
  return el;
}
