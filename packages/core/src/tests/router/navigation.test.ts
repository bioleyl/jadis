import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { defineRoutes } from '../../helpers/router.helper';
import { Router } from '../../router/router';

import type { ActiveRoute, MountOptions, RouterOptions } from '../../types/router.type';

class HomeView extends Jadis {
  static readonly selector = 'home-view';
}

class OrderView extends Jadis {
  static readonly selector = 'order-view';
}

/** A page that asks before it is left, and refuses. */
class GuardedView extends Jadis {
  static readonly selector = 'guarded-view';

  canLeave(): boolean {
    return false;
  }
}

HomeView.register();
OrderView.register();
GuardedView.register();

const routes = defineRoutes({
  guarded: { page: GuardedView, path: '/guarded' },
  home: { page: HomeView, path: '/' },
  order: { page: OrderView, path: '/orders/:id' },
  orders: { page: HomeView, path: '/orders' },
});

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('Router navigation', () => {
  let container: HTMLElement;
  let controller: AbortController;

  const start = (options: RouterOptions = {}, mount?: MountOptions) => {
    const router = new Router(routes, { signal: controller.signal, ...options });
    router.mountOn(container, mount);
    return router;
  };

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    controller = new AbortController();
  });

  afterEach(() => controller.abort());

  describe('match', () => {
    it("finds a path's route, with its parameters and its query", () => {
      const route = start().match('/orders/42?tab=lines');

      expect(route?.name).toBe('order');
      expect(route?.params).toEqual({ id: '42' });
      expect(route?.query.get('tab')).toBe('lines');
    });

    it('finds nothing for a path no route matches', () => {
      expect(start().match('/invoices/7')).toBeUndefined();
    });
  });

  describe('gotoPath', () => {
    it('goes to the route of a path, its query included', () => {
      const router = start();

      router.gotoPath('/orders/42?tab=lines');

      expect(window.location.pathname).toBe('/orders/42');
      expect(window.location.search).toBe('?tab=lines');
      expect(router.currentRoute.name).toBe('order');
      expect(router.currentRoute.query.get('tab')).toBe('lines');
      expect(container.querySelector(OrderView.selector)?.getAttribute('id')).toBe('42');
    });

    it('goes to a hash path in hash mode', () => {
      const router = start({ mode: 'hash' });

      router.gotoPath('/orders/7');

      expect(window.location.hash).toBe('#/orders/7');
      expect(router.currentRoute.params).toEqual({ id: '7' });
    });

    it('refuses a path no route matches', () => {
      expect(() => start().gotoPath('/invoices/7')).toThrowError('No route found for path: /invoices/7');
    });

    it('asks the page shown before it leaves', () => {
      const router = start();
      router.goto('guarded');

      router.gotoPath('/orders/1');

      expect(router.currentRoute.name).toBe('guarded');
    });
  });

  describe('replace', () => {
    it('writes the route in place of the current history entry', () => {
      const router = start();
      router.goto('orders');
      const length = window.history.length;

      router.replace('order', { id: '3' });

      expect(window.history.length).toBe(length);
      expect(window.location.pathname).toBe('/orders/3');
      expect(router.currentRoute.name).toBe('order');
    });

    it('keeps the number of the entry it replaces', () => {
      const router = start();
      router.goto('orders');
      const index = (window.history.state as Record<string, unknown>).jadisRouterIndex;

      router.replacePath('/orders/5');

      expect((window.history.state as Record<string, unknown>).jadisRouterIndex).toBe(index);
    });
  });

  describe('bus', () => {
    it('says each route shown, the first one included', () => {
      const router = new Router(routes, { signal: controller.signal });
      const shown: ActiveRoute[] = [];
      router.bus.register('change', (route) => shown.push(route), controller.signal);

      router.mountOn(container);
      router.goto('order', { id: '9' });

      expect(shown.map((route) => route.name)).toEqual(['home', 'order']);
      expect(shown[1]?.params).toEqual({ id: '9' });
    });

    it('says nothing when the page refuses to be left', () => {
      const router = start();
      router.goto('guarded');
      const onChange = vi.fn();
      router.bus.register('change', onChange, controller.signal);

      router.goto('home');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('lets the app put each new page in the document', () => {
      const shows: Array<[string, string | undefined]> = [];
      const show = (next: HTMLElement, current: HTMLElement | undefined) => {
        shows.push([next.tagName.toLowerCase(), current?.tagName.toLowerCase()]);
        container.append(next);
      };
      const router = start({}, { show });

      router.goto('order', { id: '1' });

      expect(shows).toEqual([
        ['home-view', undefined],
        ['order-view', 'home-view'],
      ]);
      expect(container.children).toHaveLength(2);
    });
  });

  describe('links', () => {
    /** Clicks a link, and stops the browser following it: jsdom cannot load another page. */
    const click = (link: HTMLAnchorElement, init: MouseEventInit = {}): boolean => {
      const followed = { byRouter: false };
      document.addEventListener(
        'click',
        (event) => {
          followed.byRouter = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true }
      );
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, ...init }));
      return followed.byRouter;
    };

    const link = (href: string, attributes: Record<string, string> = {}): HTMLAnchorElement => {
      const anchor = document.createElement('a');
      anchor.href = href;
      for (const [name, value] of Object.entries(attributes)) {
        anchor.setAttribute(name, value);
      }
      return document.body.appendChild(anchor);
    };

    it('follows a link to one of the routes, without loading the page again', () => {
      const router = start({ links: true });

      expect(click(link('/orders/42?tab=lines'))).toBe(true);
      expect(router.currentRoute.name).toBe('order');
      expect(window.location.search).toBe('?tab=lines');
    });

    it('follows a link inside a shadow root', () => {
      const router = start({ links: true });
      const host = document.body.appendChild(document.createElement('div'));
      const anchor = document.createElement('a');
      anchor.href = '/orders/8';
      host.attachShadow({ mode: 'open' }).append(anchor);

      expect(click(anchor)).toBe(true);
      expect(router.currentRoute.params).toEqual({ id: '8' });
    });

    it.each([
      ['a click with a modifier key', link, { ctrlKey: true }],
      ['a click with another button', link, { button: 1 }],
    ] as const)('leaves %s to the browser', (_, make, init) => {
      const router = start({ links: true });

      expect(click(make('/orders/1'), init)).toBe(false);
      expect(router.currentRoute.name).toBe('home');
    });

    it.each([
      ['in another browsing context', { target: '_blank' }],
      ['to download', { download: '' }],
      ['marked external', { rel: 'external' }],
    ])('leaves a link %s to the browser', (_, attributes) => {
      const router = start({ links: true });

      expect(click(link('/orders/1', attributes))).toBe(false);
      expect(router.currentRoute.name).toBe('home');
    });

    it('leaves a link to another origin, or to a path no route matches, to the browser', () => {
      start({ links: true });

      expect(click(link('https://example.com/orders/1'))).toBe(false);
      expect(click(link('/invoices/1'))).toBe(false);
    });

    it('leaves the links alone unless asked to follow them', () => {
      const router = start();

      expect(click(link('/orders/1'))).toBe(false);
      expect(router.currentRoute.name).toBe('home');
    });

    it('adds no history entry for a link to the page shown', async () => {
      const router = start({ links: true });
      router.goto('order', { id: '1' });
      const length = window.history.length;

      expect(click(link('/orders/1'))).toBe(true);
      await nextTask();

      expect(window.history.length).toBe(length);
    });
  });
});
