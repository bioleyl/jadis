import { assert } from './assert.helper';

import type { ComponentSelector } from './type.helper';

// A custom element name: lowercase, starting with a letter, with parts
// joined by hyphens ("my-card", "my-big-card"). Browsers refuse uppercase
// letters, so they are refused here too.
const COMPONENT_SELECTOR = /^[a-z][a-z0-9._]*(?:-[a-z0-9._]+)+$/;

// Names the HTML specification keeps for SVG and MathML elements.
const RESERVED_SELECTORS: ReadonlySet<string> = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]);

/**
 * Checks if a string is a valid component selector.
 * @param key The string to check
 * @returns True if the string is a valid custom element name, false otherwise
 */
export function isComponentSelector(key: string): key is ComponentSelector {
  return COMPONENT_SELECTOR.test(key) && !RESERVED_SELECTORS.has(key);
}

/**
 * Creates a component selector from a string.
 * @param name The name of the component: lowercase, with at least one hyphen.
 * @throws Will throw an error if the name is not a valid custom element name.
 * @returns The component selector
 */
export const createSelector = (name: string): ComponentSelector => {
  assert(
    isComponentSelector(name),
    `Invalid custom element name: ${name} (lowercase, starting with a letter, with at least one hyphen)`
  );
  return name;
};
