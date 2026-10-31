/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — lifecycle', () => {
  it('connectedCallback should call onConnect', async () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    el.onConnect = spy;
    document.body.appendChild(el);

    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
    }, 0);
  });

  it('aborts the kill signal and calls onDisconnect once removed, a microtask later', async () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    el.onDisconnect = spy;

    document.body.appendChild(el);
    document.body.removeChild(el);
    expect(spy).not.toHaveBeenCalled();
    await Promise.resolve();

    expect(spy).toHaveBeenCalledOnce();
    expect(el['killSignal'].aborted).toBe(true);
    expect(el.isConnected).toBe(false);
  });

  describe('a move', () => {
    const lists = () => {
      document.body.replaceChildren();
      return [document.createElement('ul'), document.createElement('ul')].map((list) =>
        document.body.appendChild(list)
      );
    };

    it('keeps the listeners, the kill signal and the connection as they were', async () => {
      const [first, second] = lists();
      const el = first.appendChild(createElement(TestComponent));
      const events = el['useEvents']<{ press: undefined }>();
      const onPress = vi.fn();
      events.register('press', onPress);
      const signal = el['killSignal'];

      second.append(el);
      first.insertBefore(el, null);
      second.replaceChildren(el);
      await Promise.resolve();
      events.emit('press');

      expect(onPress).toHaveBeenCalledOnce();
      expect(el['killSignal']).toBe(signal);
      expect(signal.aborted).toBe(false);
      expect(el.isConnected).toBe(true);
    });

    it('calls neither onDisconnect nor onConnect again', async () => {
      const [first, second] = lists();
      const el = first.appendChild(createElement(TestComponent));
      const onConnect = vi.fn();
      const onDisconnect = vi.fn();
      el.onConnect = onConnect;
      el.onDisconnect = onDisconnect;
      await vi.waitFor(() => expect(onConnect).toHaveBeenCalledOnce());

      second.append(el);
      await new Promise((resolve) => setTimeout(resolve));

      expect(onConnect).toHaveBeenCalledOnce();
      expect(onDisconnect).not.toHaveBeenCalled();
    });

    it('is a removal when the element is not put back in the same task', async () => {
      const [first] = lists();
      const el = first.appendChild(createElement(TestComponent));
      const signal = el['killSignal'];

      el.remove();
      await Promise.resolve();
      first.append(el);

      expect(signal.aborted).toBe(true);
      expect(el['killSignal'].aborted).toBe(false);
    });

    it('ends removed when it is put back, then removed again, in the same task', async () => {
      const [first, second] = lists();
      const el = first.appendChild(createElement(TestComponent));
      const onDisconnect = vi.fn();
      el.onDisconnect = onDisconnect;

      second.append(el);
      el.remove();
      await Promise.resolve();

      expect(onDisconnect).toHaveBeenCalledOnce();
      expect(el.isConnected).toBe(false);
    });
  });
});
