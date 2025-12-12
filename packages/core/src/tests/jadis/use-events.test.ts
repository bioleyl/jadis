/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — useEvents', () => {
  it('should register and emit events', () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    const events = el['useEvents']<{ ping: string }>();
    const spy = vi.fn();

    events.register('ping', spy);
    events.emit('ping', 'hello');

    expect(spy).toHaveBeenCalledWith('hello');
  });
});
