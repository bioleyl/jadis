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

    expect(spyPing).toHaveBeenCalledWith('hello', expect.any(CustomEvent));
    expect(spyPong).toHaveBeenCalledWith(null, expect.any(CustomEvent));
  });

  it('gives a callback the event after its detail, and says when it was cancelled', () => {
    const el = createElement(TestComponent);
    document.body.appendChild(el);
    const events = el['useEvents']<{ close: string }>();

    expect(events.emit('close', 'not heard')).toBe(true);

    events.register('close', (reason, event) => {
      if (reason === 'unsaved') {
        event.preventDefault();
      }
    });

    expect(events.emit('close', 'saved')).toBe(true);
    expect(events.emit('close', 'unsaved')).toBe(false);
  });

  it("hears the component's own events only, not one of the same name that bubbles up from a child", () => {
    const el = createElement(TestComponent);
    const field = document.createElement('select');
    el.append(field);
    document.body.appendChild(el);
    const events = el['useEvents']<{ change: string }>();
    const heard = vi.fn();
    events.register('change', heard);

    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: 'theirs' }));
    expect(heard).not.toHaveBeenCalled();

    events.emit('change', 'ours');
    expect(heard).toHaveBeenCalledExactlyOnceWith('ours', expect.any(CustomEvent));
  });
});
