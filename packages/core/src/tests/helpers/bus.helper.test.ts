import { describe, expect, it, vi } from 'vitest';

import { Bus } from '../../helpers/bus.helper';

describe('Bus helper', () => {
  it('should publish and subscribe to events correctly', () => {
    const bus = new Bus<{
      myEvent: { data: number };
      pongEvent: undefined;
    }>();

    const callback = vi.fn();
    const pongCallback = vi.fn();
    const signal = new AbortController().signal;
    bus.register('myEvent', callback, signal);
    bus.register('pongEvent', pongCallback, signal);

    bus.emit('myEvent', { data: 123 });
    expect(callback).toHaveBeenCalledWith({ data: 123 });
    bus.emit('pongEvent');
    expect(pongCallback).toHaveBeenCalledWith(null);
  });

  it('should unsubscribe when the kill signal is triggered', () => {
    const bus = new Bus<{
      myEvent: { data: number };
    }>();

    const callback = vi.fn();
    const abort = new AbortController();
    bus.register('myEvent', callback, abort.signal);

    bus.emit('myEvent', { data: 123 });
    expect(callback).toHaveBeenCalledWith({ data: 123 });

    abort.abort();

    bus.emit('myEvent', { data: 456 });
    expect(callback).not.toHaveBeenCalledWith({ data: 456 });
  });
});
