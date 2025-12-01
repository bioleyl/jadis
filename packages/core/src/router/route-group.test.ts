import { beforeEach, describe, expect } from 'vitest';

import { Jadis } from '../base-component';
import { defineRouteGroup, defineRoutes } from '../helpers/router.helper';
import { Router } from './router';

import type { RouteDef, RouterOptions } from '../types/router.type';

class BasePage extends Jadis {
  static readonly selector = 'base-page';
}

class HomePage extends Jadis {
  static readonly selector = 'home-page';
}

const InitiateRouter = <T extends Record<string, RouteDef>>(
  routes: T = {} as T,
  options?: RouterOptions
): {
  container: HTMLDivElement;
  router: Router<
    T & {
      readonly base: {
        readonly page: () => typeof BasePage;
        readonly path: '/';
      };
    }
  >;
} => {
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  document.body.innerHTML = '';
  document.body.appendChild(appContainer);

  const routerInstance = new Router(
    {
      ...routes,
      base: { page: () => BasePage, path: '/' },
    },
    options
  );
  routerInstance.mountOn(appContainer);

  return { container: appContainer, router: routerInstance };
};

describe('Route Group', () => {
  beforeEach(() => {
    // Reset the URL to root
    window.history.pushState({}, '', '/');
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/group/home')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/group/home')],
  ])('should add a route group and navigate to it', (options, assertUrl) => {
    const routes = defineRoutes({
      group: defineRouteGroup('/group', {
        home: { page: () => HomePage, path: '/home' },
      }),
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('groupHome');

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/group/home/456')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/group/home/456')],
  ])('should add a route group with params and navigate to it', (options, assertUrl) => {
    const routes = defineRoutes({
      group: defineRouteGroup('/group', {
        home: { page: () => HomePage, path: '/home/:id' },
      }),
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('groupHome', { id: '456' });

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('456');
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/group/456/home')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/group/456/home')],
  ])('should handle parameter in route prefix', (options, assertUrl) => {
    const routes = defineRoutes({
      group: defineRouteGroup('/group/:id', {
        home: { page: () => HomePage, path: '/home' },
      }),
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('groupHome', { id: '456' });

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('456');
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/group/subgroup/home')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/group/subgroup/home')],
  ])('should add a route group inside a route group and navigate to it', (options, assertUrl) => {
    const routes = defineRoutes({
      group: defineRouteGroup('/group', {
        subgroup: defineRouteGroup('/subgroup', {
          home: { page: () => HomePage, path: '/home' },
        }),
      }),
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('groupSubgroupHome');

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/group/subgroup/home')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/group/subgroup/home')],
  ])(
    'should add a route group inside a route group and navigate to it with a root component',
    (options, assertUrl) => {
      const routes = defineRoutes({
        group: defineRouteGroup(
          '/group',
          {
            subgroup: defineRouteGroup('/subgroup', {
              home: { page: () => HomePage, path: '/home' },
            }),
          },
          { rootComponentSelector: 'group-root' }
        ),
      });
      const { router, container } = InitiateRouter(routes, options);
      router.goto('groupSubgroupHome');

      assertUrl();
      const groupRoot = container.querySelector('group-root');
      expect(groupRoot).toBeTruthy();
      const component = groupRoot?.querySelector(HomePage.selector);
      expect(component).toBeTruthy();
    }
  );
});
