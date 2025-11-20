import { ChangeHandler } from './change.helper';
import { toKebabCase } from './string.helper';

import type { JadisConstructor } from '../base-component';
import type { AppendableElement, ElementValues, OptionsWithProps } from './type.helper';

/**
 * Creates a new HTML element.
 * This function allows you to create an HTML element with specified attributes
 * and append it to a specified parent element.
 * @param tag The tag name of the element to create
 * @param options An optional set of properties and attributes to set on the component {attrs: {}, props: {}}
 * @param appendTo The element to append the new element to
 * @returns The created HTML element
 * @example
 * const newElement = createElement('div', {attrs: { class: 'my-class', id: 'my-id' },
 * props: {myProp: propValue}}, document.body);
 */
export function createElement<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options?: OptionsWithProps<ElementValues<HTMLElementTagNameMap[Tag]>>,
  appendTo?: AppendableElement
): HTMLElementTagNameMap[Tag];
export function createElement<T extends HTMLElement>(
  tag: string,
  options?: OptionsWithProps<ElementValues<T>>,
  appendTo?: AppendableElement
): T;
export function createElement<Component extends JadisConstructor>(
  tag: Component,
  options?: OptionsWithProps<ElementValues<InstanceType<Component>>>,
  appendTo?: AppendableElement
): InstanceType<Component>;
export function createElement(
  tag: string,
  options: OptionsWithProps<Record<string, unknown>> = {},
  appendTo?: AppendableElement
): HTMLElement {
  const el = document.createElement(tag.toString());
  Object.entries(options.props ?? {}).forEach(([key, value]) => {
    const prop = el as HTMLElement & Record<string, unknown>;
    if (prop[key] instanceof ChangeHandler) {
      prop[key].set(value);
    } else {
      prop[key] = value;
    }
  });
  Object.entries(options.attrs ?? {}).forEach(([key, value]) => {
    el.setAttribute(toKebabCase(key), String(value));
  });
  appendTo?.appendChild(el);
  return el;
}
