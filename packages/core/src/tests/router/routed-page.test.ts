import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { defineRoutes } from '../../helpers/router.helper';
import { Router } from '../../router/router';

import type { ActiveRoute, RouterOptions } from '../../types/router.type';

/** A page that follows the route itself: the router keeps it while the route stays on it. */
class ItemsPage extends Jadis {
  static readonly selector = 'items-page';
  readonly routes: ActiveRoute[] = [];
  readonly calls: string[] = [];
  allowLeave = true;
  readonly leaveAsked: ActiveRoute[] = [];

  onConnect(): void {
    this.calls.push('connect');
  }

  onRoute(route: ActiveRoute): void {
    this.calls.push('route');
    this.routes.push(route);
  }

  canLeave(next: ActiveRoute): boolean {
    this.leaveAsked.push(next);
    return this.allowLeave;
  }
}

/** A page without onRoute: the router makes it again at each navigation, as before. */
class PlainPage extends Jadis {
  static readonly selector = 'plain-page';
}

ItemsPage.register();
PlainPage.register();

const routes = defineRoutes({
  item: { page: ItemsPage, path: '/items/:itemId' },
  items: { page: ItemsPage, path: '/items' },
  plain: { page: PlainPage, path: '/plain/:id' },
  root: { page: PlainPage, path: '/' },
});

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('Router with routed pages', () => {
  let container: HTMLElement;
  let controller: AbortController;

  const start = (options: RouterOptions = {}) => {
    const router = new Router(routes, { signal: controller.signal, ...options });
    router.mountOn(container);
    return router;
  };

  const page = <T extends Element>(selector: string): T => {
    const found = container.querySelector<T & Element>(selector);
    expect(found).toBeTruthy();
    return found as T;
  };

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    controller = new AbortController();
  });

  afterEach(() => controller.abort());

  describe('query', () => {
    it('matches a hash with a query, and gives the query to the route', async () => {
      window.history.replaceState({}, '', '/#/items?type=agent&text=smith');
      const router = start({ mode: 'hash' });
      await nextTask();

      expect(router.currentRoute.name).toBe('items');
      expect(router.currentRoute.query.get('type')).toBe('agent');
      expect(page<ItemsPage>('items-page').routes[0]?.query.get('text')).toBe('smith');
    });

    it('reads the query of the URL in history mode', async () => {
      window.history.replaceState({}, '', '/items/42?tab=terms');
      const router = start();
      await nextTask();

      expect(router.currentRoute.params).toEqual({ itemId: '42' });
      expect(router.currentRoute.query.get('tab')).toBe('terms');
    });
  });

  describe('reuse', () => {
    it('makes a page without onRoute again at each navigation', () => {
      const router = start();
      router.goto('plain', { id: '1' });
      const first = page('plain-page');
      router.goto('plain', { id: '2' });

      expect(page('plain-page')).not.toBe(first);
      expect(page('plain-page').getAttribute('id')).toBe('2');
    });

    it('keeps a page with onRoute while the routes stay on it, and gives it each route', async () => {
      const router = start();
      router.goto('items');
      await nextTask();
      const items = page<ItemsPage>('items-page');

      router.goto('item', { itemId: '7' });

      expect(page('items-page')).toBe(items);
      expect(items.getAttribute('item-id')).toBe('7');
      expect(items.routes.map(({ name, params }) => ({ name, params }))).toEqual([
        { name: 'items', params: {} },
        { name: 'item', params: { itemId: '7' } },
      ]);
    });

    it('removes the attributes of the parameters the new route does not have', async () => {
      window.history.replaceState({}, '', '/items/7');
      const router = start();
      await nextTask();

      router.goto('items');

      expect(page('items-page').hasAttribute('item-id')).toBe(false);
    });

    it('gives a new page its route after its onConnect', async () => {
      start().goto('items');
      const items = page<ItemsPage>('items-page');
      expect(items.routes).toHaveLength(0);

      await nextTask();

      expect(items.calls).toEqual(['connect', 'route']);
    });

    it('gives a new page only the last route when it changes before the page is connected', async () => {
      const router = start();
      router.goto('items');
      router.goto('item', { itemId: '9' });
      await nextTask();

      expect(page<ItemsPage>('items-page').routes.map(({ params }) => params)).toEqual([{ itemId: '9' }]);
    });
  });

  describe('canLeave', () => {
    it('asks the page before going elsewhere, with the route it would go to', async () => {
      const router = start();
      router.goto('items');
      await nextTask();
      const items = page<ItemsPage>('items-page');

      router.goto('plain', { id: '3' });

      expect(items.leaveAsked.map(({ name, params }) => ({ name, params }))).toEqual([
        { name: 'plain', params: { id: '3' } },
      ]);
      expect(page('plain-page')).toBeTruthy();
    });

    it('stays when the page refuses a goto: neither the URL nor the page change', async () => {
      const router = start();
      router.goto('item', { itemId: '1' });
      await nextTask();
      const items = page<ItemsPage>('items-page');
      items.allowLeave = false;

      router.goto('item', { itemId: '2' });

      expect(window.location.pathname).toBe('/items/1');
      expect(router.currentRoute.params).toEqual({ itemId: '1' });
      expect(items.routes).toHaveLength(1);
    });

    it('puts the URL back when the page refuses a change made in the address bar', async () => {
      window.history.replaceState({}, '', '/#/items/1');
      start({ mode: 'hash' });
      await nextTask();
      const items = page<ItemsPage>('items-page');
      items.allowLeave = false;

      window.location.hash = '#/plain/5';
      await vi.waitFor(() => expect(items.leaveAsked).toHaveLength(1));

      expect(window.location.hash).toBe('#/items/1');
      expect(container.querySelector('plain-page')).toBeNull();
    });

    it('does not ask when the URL did not change', async () => {
      window.history.replaceState({}, '', '/#/items');
      start({ mode: 'hash' });
      await nextTask();

      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(page<ItemsPage>('items-page').leaveAsked).toHaveLength(0);
    });
  });

  it('stops following the URL once its signal aborts', async () => {
    window.history.replaceState({}, '', '/#/plain/1');
    start({ mode: 'hash' });
    const first = page('plain-page');
    controller.abort();

    window.location.hash = '#/plain/2';
    await nextTask();
    await nextTask();

    expect(page('plain-page')).toBe(first);
  });
});
