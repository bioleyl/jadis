/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — useChange', () => {
  it('should call onChange when value changes', () => {
    const el = new TestComponent();
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);
    expect(spy).toHaveBeenCalledWith(2, 1);
  });

  it('should call onChange immediately if { immediate: true } and connected', () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    const spy = vi.fn();
    el['useChange'](5, spy, { immediate: true });

    expect(spy).toHaveBeenCalledWith(5, 5);
  });
});
