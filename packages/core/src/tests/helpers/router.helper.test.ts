import { normalizePath } from '../../helpers/router.helper';

describe('Router helper', () => {
  describe('normalizePath', () => {
    it('should normalize path correctly', () => {
      expect(normalizePath('/')).toBe('/');
      expect(normalizePath('user/123')).toBe('/user/123');
      expect(normalizePath('/user/123')).toBe('/user/123');
      expect(normalizePath('///user///123///')).toBe('/user/123');
      expect(normalizePath('user/123/')).toBe('/user/123');
    });
  });
});
