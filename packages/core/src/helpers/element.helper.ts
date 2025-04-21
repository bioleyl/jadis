import { toKebabCase } from './string.helper';

export const createElement = <T = HTMLElement>(
  tag: string,
  attributes: Record<string, string> = {},
  appendTo: HTMLElement | ShadowRoot | null = null
): T => {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) =>
    el.setAttribute(toKebabCase(key), decodeURI(value))
  );
  appendTo?.appendChild(el);
  return el as T;
};
