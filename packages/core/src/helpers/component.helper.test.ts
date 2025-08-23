import { createSelector, isComponentSelector } from './component.helper';

describe('Component helper', () => {
  describe('isComponentSelector', () => {
    it('should return true for component selectors', () => {
      expect(isComponentSelector('my-component')).toBe(true);
    });

    it('should return false for non-component selectors', () => {
      expect(isComponentSelector('div')).toBe(false);
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
