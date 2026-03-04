/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — useChange', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should call onChange when value changes', () => {
    const el = createElement(TestComponent, {}, document.body);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);
    expect(spy).toHaveBeenCalledWith(2, 1);
  });

  it('should not call onChange if component is not connected', () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call onChange when component connects if value has changed', async () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);

    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(2, 1);
    });
  });

  it('should call onChange immediately if { immediate: true } and connected', () => {
    const el = createElement(TestComponent, {}, document.body);

    const spy = vi.fn();
    el['useChange'](5, spy, { immediate: true });

    expect(spy).toHaveBeenCalledWith(5, 5);
  });
});
