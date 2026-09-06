import { toKebabCase } from './string.helper';

import type { JadisConstructor } from '../base-component';
import type { ChangeHandler } from './change.helper';
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
type ChangeHandlerValue = Parameters<ChangeHandler<unknown>['set']>[0];
type ChangeHandlerLike = {
  set(value: ChangeHandlerValue): void;
};

function isChangeHandlerLike(value: unknown): value is ChangeHandlerLike {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'set' in value && typeof value.set === 'function';
}

export function applyElementAttributes(element: HTMLElement, attrs: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined) {
      continue;
    }

    element.setAttribute(toKebabCase(key), String(value));
  }
}

export function applyElementProperty(element: HTMLElement, key: string, value: unknown): void {
  if (value === undefined) {
    return;
  }

  const target = element as unknown as Record<string, unknown>;
  const currentValue = target[key];

  if (isChangeHandlerLike(currentValue)) {
    const changeHandler = currentValue as unknown as ChangeHandlerLike;
    changeHandler.set(value as ChangeHandlerValue);
    return;
  }

  target[key] = value;
}

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
export function createElement<Tag extends keyof HTMLElementTagNameMap | HTMLElement | JadisConstructor>(
  tag: Tag,
  options: OptionsWithProps<Record<string, unknown>> = {},
  appendTo?: AppendableElement
): HTMLElement {
  const el = document.createElement(tag.toString());

  for (const [key, value] of Object.entries(options.props ?? {})) {
    applyElementProperty(el, key, value);
  }

  applyElementAttributes(el, options.attrs ?? {});

  appendTo?.appendChild(el);
  return el;
}
