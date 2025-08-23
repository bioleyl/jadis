import { vi } from 'vitest';

import { Bus } from './bus.helper';

describe('Bus helper', () => {
  it('should publish and subscribe to events correctly', () => {
    const bus = new Bus<{
      myEvent: { data: number };
    }>();

    const callback = vi.fn();
    const signal = new AbortController().signal;
    bus.register('myEvent', callback, signal);

    bus.emit('myEvent', { data: 123 });
    expect(callback).toHaveBeenCalledWith({ data: 123 });
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
