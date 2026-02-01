import { INTERNAL_START_PROPERTY } from '../constants';
import { assert } from './assert.helper';

import type { Jadis } from '../base-component';
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

/**
 * Checks if an object is an instance of Jadis.
 * @param obj The object to check
 * @returns True if the object is an instance of Jadis, false otherwise
 */
export const isJadisInstance = (obj: unknown): obj is Jadis => {
  return INTERNAL_START_PROPERTY in (obj as Jadis) && INTERNAL_START_PROPERTY in (obj as Jadis);
};
