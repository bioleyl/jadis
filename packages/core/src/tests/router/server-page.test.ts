import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { defineRouteGroup, defineRoutes } from '../../helpers/router.helper';
import { Router } from '../../router/router';

import type { ActiveRoute } from '../../types/router.type';

class ShellRoot extends Jadis {
  static readonly selector = 'shell-root';
}

class ListView extends Jadis {
  static readonly selector = 'list-view';

  readonly routes = vi.fn();

  onRoute(route: ActiveRoute): void {
    this.routes(route);
  }
}

ShellRoot.register();
ListView.register();

const routes = defineRoutes({
  ...defineRouteGroup(
    '/app',
    { list: { page: ListView, path: '/list/:id' } },
    { rootComponentSelector: 'shell-root' }
  ),
  plain: { page: ListView, path: '/plain' },
});

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('Router, a page the server rendered', () => {
  let container: HTMLElement;
  let controller: AbortController;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.body.appendChild(document.createElement('div'));
    controller = new AbortController();
  });

  afterEach(() => controller.abort());

  it('takes over the elements of the route in the mount point, and gives the page its route', async () => {
    window.history.replaceState({}, '', '/app/list/7');
    container.innerHTML = '<shell-root id="7"><list-view id="7" data-from="server"></list-view></shell-root>';
    const rendered = container.querySelector('list-view') as ListView;
    const show = vi.fn();

    new Router(routes, { signal: controller.signal }).mountOn(container, { show });
    await nextTask();

    expect(show).not.toHaveBeenCalled();
    expect(container.querySelector('list-view')).toBe(rendered);
    expect(rendered.routes).toHaveBeenCalledWith(expect.objectContaining({ name: 'list', params: { id: '7' } }));
  });

  it('keeps the page it took over while the routes stay on it, and makes the next pages itself', async () => {
    window.history.replaceState({}, '', '/app/list/7');
    container.innerHTML = '<shell-root><list-view></list-view></shell-root>';
    const rendered = container.querySelector('list-view') as ListView;
    const router = new Router(routes, { signal: controller.signal });
    router.mountOn(container);

    router.gotoPath('/app/list/8');
    expect(container.querySelector('list-view')).toBe(rendered);
    router.gotoPath('/plain');
    expect(container.querySelector('list-view')).not.toBe(rendered);
  });

  it('makes the page when the mount point holds another one', () => {
    window.history.replaceState({}, '', '/plain');
    container.innerHTML = '<shell-root><list-view></list-view></shell-root>';
    const rendered = container.querySelector('list-view');

    new Router(routes, { signal: controller.signal }).mountOn(container);

    expect(container.querySelector('shell-root')).toBeNull();
    expect(container.querySelector('list-view')).not.toBe(rendered);
  });
});
