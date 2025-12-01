import { beforeEach, describe, expect, it } from 'vitest';

import { Jadis } from '../base-component';
import { defineRoutes } from '../helpers/router.helper';
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

describe('Router', () => {
  beforeEach(() => {
    // Reset the URL to root
    window.history.pushState({}, '', '/');
  });

  it('should initialize with default options', () => {
    const { router } = InitiateRouter();
    const defaultConfig = router.config;
    expect(defaultConfig.mode).toBe('history');
    expect(defaultConfig.baseUrl).toBe('/');
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/home')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/home')],
  ])('should add a route and navigate to it', (options, assertUrl) => {
    const routes = defineRoutes({
      home: { page: () => HomePage, path: '/home' },
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('home');

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/home/123')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/home/123')],
  ])('should add a route and navigate to it with params', (options, assertUrl) => {
    const routes = defineRoutes({
      home: { page: () => HomePage, path: '/home/:id' },
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('home', { id: '123' });

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('123');
  });

  it('should not navigate to a non-existing route', () => {
    const { router } = InitiateRouter();
    expect(() => router.goto('non-existing')).toThrowError('No route found for name: non-existing');
  });

  test.each([
    [{ mode: 'hash' as const }, () => expect(window.location.hash).toBe('#/home/123')],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/home/123')],
  ])('should create a root component', (options, assertUrl) => {
    const routes = defineRoutes({
      home: { options: { rootComponentSelector: 'root-component' }, page: () => HomePage, path: '/home/:id' },
    });
    const { router, container } = InitiateRouter(routes, options);
    router.goto('home', { id: '123' });

    assertUrl();
    const rootComponent = container.querySelector('root-component');
    expect(rootComponent).toBeTruthy();
    const homeComponent = rootComponent?.querySelector(HomePage.selector);
    expect(homeComponent).toBeTruthy();
    expect(homeComponent?.getAttribute('id')).toBe('123');
  });

  it('should initialize with a base URL', () => {
    const { router } = InitiateRouter({}, { baseUrl: '/app' });
    expect(router.config.baseUrl).toBe('/app');
  });

  test.each([
    [
      { mode: 'hash' as const },
      () => {
        expect(window.location.pathname).toBe('/app/');
        expect(window.location.hash).toBe('#/home');
      },
    ],
    [{ mode: 'history' as const }, () => expect(window.location.pathname).toBe('/app/home')],
  ])('should navigate to a route with base URL', (options, assertUrl) => {
    const routes = defineRoutes({
      home: { page: () => HomePage, path: '/home' },
    });
    const { router, container } = InitiateRouter(routes, { ...options, baseUrl: '/app' });
    router.goto('home');

    assertUrl();
    const component = container.querySelector(HomePage.selector);
    expect(component).toBeTruthy();
  });
});
