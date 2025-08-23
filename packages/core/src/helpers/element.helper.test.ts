import { createElement } from './element.helper';

describe('Element helper', () => {
  describe('createElement', () => {
    it('should create an element with the given tag name', () => {
      const div = createElement('div');
      expect(div).toBeInstanceOf(HTMLDivElement);
    });

    it('should create an element with the given attributes', () => {
      const div = createElement('div', { class: 'my-class', id: 'my-div' });
      expect(div).toBeInstanceOf(HTMLDivElement);
      expect(div.id).toBe('my-div');
      expect(div.className).toBe('my-class');
    });

    it('should create an element with the given parent', () => {
      const parent = document.createElement('div');
      const child = createElement('div', {}, parent);
      expect(child).toBeInstanceOf(HTMLDivElement);
      expect(parent.firstChild).toBe(child);
    });
  });
});
