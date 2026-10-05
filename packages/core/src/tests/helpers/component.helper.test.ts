import { describe, expect, it } from 'vitest';

import { createSelector, isComponentSelector } from '../../helpers/component.helper';

describe('Component helper', () => {
  describe('isComponentSelector', () => {
    it('should return true for component selectors', () => {
      expect(isComponentSelector('my-component')).toBe(true);
      expect(isComponentSelector('my-big-component')).toBe(true);
      expect(isComponentSelector('x-1')).toBe(true);
      expect(isComponentSelector('app.shell-v2_beta')).toBe(true);
    });

    it('should return false for non-component selectors', () => {
      expect(isComponentSelector('div')).toBe(false);
      expect(isComponentSelector('div-')).toBe(false);
      expect(isComponentSelector('-div')).toBe(false);
      expect(isComponentSelector('-')).toBe(false);
      expect(isComponentSelector('my--component')).toBe(false);
    });

    it('should return false for names browsers refuse', () => {
      expect(isComponentSelector('My-Component')).toBe(false);
      expect(isComponentSelector('1-component')).toBe(false);
      expect(isComponentSelector('font-face')).toBe(false);
      expect(isComponentSelector('annotation-xml')).toBe(false);
    });
  });

  describe('createSelector', () => {
    it('should create a selector for the given component', () => {
      const selector = createSelector('my-component');
      expect(selector).toBe('my-component');
    });

    it('should throw if the component name is invalid', () => {
      expect(() => createSelector('invalidComponent')).toThrow();
    });
  });
});
