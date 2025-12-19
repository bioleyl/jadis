import { assert } from './assert.helper';

import type { ComponentSelector } from './type.helper';

/**
 * Checks if a string is a valid component selector.
 * @param key The string to check
 * @returns True if the string is a valid component selector, false otherwise
 */
export function isComponentSelector(key: string): key is ComponentSelector {
  return /^[^-]+-[^-]+$/.test(key);
}

/**
 * Creates a component selector from a string.
 * @param name The name of the component. It must contain a hyphen.
 * @throws Will throw an error if the name does not contain a hyphen.
 * @returns The component selector
 */
export const createSelector = (name: string): ComponentSelector => {
  assert(isComponentSelector(name), `Custom element name must contain a hyphen: ${name}`);
  return name;
};
