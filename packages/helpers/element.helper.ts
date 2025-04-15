import { toKebabCase } from '../string.helperlper';

export function createElement<T = HTMLElement>(
  tag: string,
  attributes: Record<string, string> = {},
  appendTo?: HTMLElement | ShadowRoot
): T {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) =>
    el.setAttribute(toKebabCase(key), value)
  );
  appendTo?.appendChild(el);
  return el as T;
}
