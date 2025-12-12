/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — getElement', () => {
  it('should return an element in shadow DOM', () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    const found = el['getElement']('#inside');
    expect(found).toBe(el.shadowRoot.querySelector('#inside'));
  });

  it('should throw if element not found', () => {
    const el = new TestComponent();

    expect(() => el['getElement']('#missing')).toThrow();
  });
});
