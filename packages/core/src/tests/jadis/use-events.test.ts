/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — useEvents', () => {
  it('should register and emit events', () => {
    const el = createElement(TestComponent);
    document.body.appendChild(el);

    const events = el['useEvents']<{ ping: string; pong: undefined }>();
    const spyPing = vi.fn();
    const spyPong = vi.fn();

    events.register('ping', spyPing);
    events.register('pong', spyPong);
    events.emit('ping', 'hello');
    events.emit('pong');

    expect(spyPing).toHaveBeenCalledWith('hello');
    expect(spyPong).toHaveBeenCalledWith(null);
  });
});
