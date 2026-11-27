import { afterEach, describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';

const calls: string[] = [];

class ConnectedChild extends Jadis {
  static readonly selector = 'connected-child';

  onConnect(): void {
    calls.push('child');
  }
}

/** A view that draws a child in its onConnect: the child's onConnect comes a task later still. */
class ConnectedParent extends Jadis {
  static readonly selector = 'connected-parent';

  onConnect(): void {
    calls.push('parent');
    this.shadowRoot?.append(new ConnectedChild());
  }
}

class ConnectedPlain extends Jadis {
  static readonly selector = 'connected-plain';
}

class ConnectedFailing extends Jadis {
  static readonly selector = 'connected-failing';

  onConnect(): void {
    throw new Error('onConnect failed');
  }
}

ConnectedChild.register();
ConnectedParent.register();
ConnectedPlain.register();
ConnectedFailing.register();

/** Whether a promise is resolved by now, microtasks run: without waiting for a task. */
const isResolved = async (promise: Promise<void>): Promise<boolean> => {
  const state = { resolved: false };
  void promise.then(() => {
    state.resolved = true;
  });
  await Promise.resolve();
  await Promise.resolve();
  return state.resolved;
};

describe('Jadis — waiting for onConnect', () => {
  afterEach(async () => {
    document.body.replaceChildren();
    await Jadis.settled();
    calls.length = 0;
  });

  describe('connected', () => {
    it('resolves once the onConnect of the connection has returned', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      const connected = child.connected;

      expect(await isResolved(connected)).toBe(false);
      expect(calls).toEqual([]);
      await connected;

      expect(calls).toEqual(['child']);
    });

    it('is resolved already once onConnect has run', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      await child.connected;

      expect(await isResolved(child.connected)).toBe(true);
    });

    it('resolves for a component without onConnect', async () => {
      const plain = document.body.appendChild(new ConnectedPlain());

      await expect(plain.connected).resolves.toBeUndefined();
    });

    it('waits for the connection when asked before it', async () => {
      const child = new ConnectedChild();
      const connected = child.connected;

      expect(await isResolved(connected)).toBe(false);
      document.body.append(child);
      await connected;

      expect(calls).toEqual(['child']);
    });

    it('resolves without calling onConnect when the component is removed first', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      const connected = child.connected;
      child.remove();

      await connected;

      expect(calls).toEqual([]);
    });

    it('has a promise of its own for each connection', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      await child.connected;
      child.remove();
      await Promise.resolve();

      const next = child.connected;
      expect(await isResolved(next)).toBe(false);
      document.body.append(child);
      await next;

      expect(calls).toEqual(['child', 'child']);
    });

    it('waits for the new connection of a component removed and added again before its onConnect', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      child.remove();
      await Promise.resolve();
      document.body.append(child);

      await child.connected;

      expect(calls).toEqual(['child']);
    });

    it('stays as it is through a move', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      await child.connected;

      document.body.appendChild(document.createElement('div')).append(child);

      expect(await isResolved(child.connected)).toBe(true);
      expect(calls).toEqual(['child']);
    });

    it('resolves when onConnect throws, the error thrown by the task as before', async () => {
      vi.useFakeTimers();
      const failing = document.body.appendChild(new ConnectedFailing());
      const connected = failing.connected;

      expect(() => vi.runAllTimers()).toThrow('onConnect failed');
      vi.useRealTimers();

      expect(await isResolved(connected)).toBe(true);
      expect(await isResolved(Jadis.settled())).toBe(true);
    });
  });

  describe('settled', () => {
    it('resolves at once when no onConnect is left to call', async () => {
      expect(await isResolved(Jadis.settled())).toBe(true);
    });

    it('resolves once every onConnect has run, those of the components an onConnect connected included', async () => {
      document.body.append(new ConnectedParent(), new ConnectedChild());

      await Jadis.settled();

      expect(calls).toEqual(['parent', 'child', 'child']);
    });

    it('leaves every component connected by then with its connected resolved', async () => {
      const parent = document.body.appendChild(new ConnectedParent());

      await Jadis.settled();

      const child = parent.shadowRoot?.querySelector<ConnectedChild>(ConnectedChild.selector);
      expect(child && (await isResolved(child.connected))).toBe(true);
    });

    it('resolves when the components were removed before their onConnect', async () => {
      const child = document.body.appendChild(new ConnectedChild());
      child.remove();

      await Jadis.settled();

      expect(calls).toEqual([]);
    });
  });
});
