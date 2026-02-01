/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — useAttributes', () => {
  it('should create getters for attributes', () => {
    const el = createElement(TestComponent);
    el.setAttribute('foo', 'bar');

    const attrs = el['useAttributes']('foo');

    expect(attrs.foo).toBe('bar');
  });
});
