/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — lifecycle', () => {
  it('connectedCallback should call onConnect', async () => {
    const el = new TestComponent();
    const spy = vi.fn();
    el.onConnect = spy;
    document.body.appendChild(el);

    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
    }, 0);
  });

  it('disconnectedCallback should abort killSignal and call onDisconnect', () => {
    const el = new TestComponent();
    const spy = vi.fn();
    el.onDisconnect = spy;

    document.body.appendChild(el);
    document.body.removeChild(el);

    expect(spy).toHaveBeenCalled();
    expect(el['killSignal'].aborted).toBe(true);
  });
});
