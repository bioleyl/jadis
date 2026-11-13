/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — useAttributes', () => {
  it('should create getters for attributes', () => {
    const el = createElement(TestComponent);
    el.setAttribute('foo', 'bar');

    const attrs = el['useAttributes']({ foo: vi.fn() });

    expect(attrs.foo).toBe('bar');
  });

  it('should register callbacks for attributes', () => {
    const el = createElement(TestComponent);
    const callback = vi.fn();

    el['useAttributes']({ foo: callback });
    el.attributeChangedCallback('foo', 'old', 'new');

    expect(callback).toHaveBeenCalledWith('new', 'old');
  });

  it('should observe attributes without static observedAttributes', async () => {
    const el = createElement(TestComponent);
    const callback = vi.fn();

    el['useAttributes']({ foo: callback });
    el.setAttribute('foo', 'before-connect');
    document.body.appendChild(el);

    expect(callback).toHaveBeenCalledWith('before-connect', null);

    el.setAttribute('foo', 'after-connect');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenLastCalledWith('after-connect', 'before-connect');
    el.remove();
  });

  it('tells a component that comes back only of the attributes that changed while it was away', async () => {
    const el = createElement(TestComponent);
    const kept = vi.fn();
    const changed = vi.fn();
    el['useAttributes']({ changed, kept });
    el.setAttribute('kept', 'same');
    el.setAttribute('changed', 'before');
    document.body.appendChild(el);

    el.remove();
    await Promise.resolve();
    el.setAttribute('changed', 'after');
    document.body.appendChild(el);

    expect(kept).toHaveBeenCalledExactlyOnceWith('same', null);
    expect(changed).toHaveBeenLastCalledWith('after', 'before');
    el.remove();
  });
});
