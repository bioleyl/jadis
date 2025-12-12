/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — toggleClass', () => {
  it('should add class when condition = true', () => {
    const el = new TestComponent();
    el['toggleClass']('active', true);
    expect(el.classList.contains('active')).toBe(true);
  });

  it('should remove class when condition = false', () => {
    const el = new TestComponent();
    el.classList.add('active');
    el['toggleClass']('active', false);
    expect(el.classList.contains('active')).toBe(false);
  });
});
