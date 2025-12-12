import { toKebabCase } from '../../helpers/string.helper';

describe('String helper', () => {
  describe('toKebabCase', () => {
    it('should convert a string to kebab case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
      expect(toKebabCase('helloWWorld')).toBe('hello-w-world');
    });
  });
});
