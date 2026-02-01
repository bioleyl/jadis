/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — toggleClass', () => {
  it('should add class when condition = true', () => {
    const el = createElement(TestComponent);
    el['toggleClass']('active', true);
    expect(el.classList.contains('active')).toBe(true);
  });

  it('should remove class when condition = false', () => {
    const el = createElement(TestComponent);
    el.classList.add('active');
    el['toggleClass']('active', false);
    expect(el.classList.contains('active')).toBe(false);
  });
});
