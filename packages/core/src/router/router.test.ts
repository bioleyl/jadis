import { beforeEach, describe, expect, it } from 'vitest';

import { Router } from './router';

import type { RouterOptions } from '../types/router.type';

const InitiateRouter = (options?: RouterOptions): { router: Router; container: HTMLDivElement } => {
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  document.body.innerHTML = '';
  document.body.appendChild(appContainer);

  const routerInstance = new Router(options);
  routerInstance.addRoute('/', 'base-page', 'base');
  routerInstance.mountOn(appContainer);

  return { container: appContainer, router: routerInstance };
};

describe('Router', () => {
  beforeEach(() => {
    // Reset the URL to root
    window.history.pushState({}, '', '/');
  });

  describe('History Mode Router', () => {
    it('should initialize with default options', () => {
      const { router } = InitiateRouter();
      const defaultConfig = router.config;
      expect(defaultConfig.mode).toBe('history');
      expect(defaultConfig.baseUrl).toBe('/');
    });

    it('should add a route and navigate to it', () => {
      const { router, container } = InitiateRouter();
      router.addRoute('/home', 'home-component', 'home');
      router.gotoPath('/home');

      expect(window.location.pathname).toBe('/home');
      const component = container.querySelector('home-component');
      expect(component).toBeTruthy();
    });

    it('should add a route and navigate to it with params', () => {
      const { router, container } = InitiateRouter();
      router.addRoute('/user/:id', 'user-component', 'user');
      router.gotoPath('/user/123');

      expect(window.location.pathname).toBe('/user/123');
      const component = container.querySelector('user-component');
      expect(component).toBeTruthy();
      expect(component?.getAttribute('id')).toBe('123');
    });

    it('should add route and navigate to by name', () => {
      const { router, container } = InitiateRouter();
      router.addRoute('/about', 'about-component', 'about');
      router.gotoName('about');

      expect(window.location.pathname).toBe('/about');
      const component = container.querySelector('about-component');
      expect(component).toBeTruthy();
    });

    it('should add a route and navigate to it by name with params', () => {
      const { router, container } = InitiateRouter();
      router.addRoute('/product/:id', 'product-component', 'product');
      router.gotoName('product', { id: '456' });

      expect(window.location.pathname).toBe('/product/456');
      const component = container.querySelector('product-component');
      expect(component).toBeTruthy();
      expect(component?.getAttribute('id')).toBe('456');
    });
    describe('With Base URL', () => {
      it('should initialize with a base URL', () => {
        const { router } = InitiateRouter({ baseUrl: '/app' });
        expect(router.config.baseUrl).toBe('/app');
      });

      it('should navigate to a route with base URL', () => {
        const { router, container } = InitiateRouter({ baseUrl: '/app' });
        router.addRoute('/dashboard', 'dashboard-component');
        router.gotoPath('/dashboard');

        expect(window.location.pathname).toBe('/app/dashboard');
        const component = container.querySelector('dashboard-component');
        expect(component).toBeTruthy();
      });

      it('should navigate to a route by name with base URL', () => {
        const { router, container } = InitiateRouter({ baseUrl: '/app' });
        router.addRoute('/settings', 'settings-component', 'settings');
        router.gotoName('settings');

        expect(window.location.pathname).toBe('/app/settings');
        const component = container.querySelector('settings-component');
        expect(component).toBeTruthy();
      });
    });
  });

  describe('Hash Mode Router', () => {
    it('should initialize with hash mode', () => {
      const { router } = InitiateRouter({ mode: 'hash' });
      expect(router.config.mode).toBe('hash');
    });

    it('should add a route and navigate to it in hash mode', () => {
      const { router, container } = InitiateRouter({ mode: 'hash' });
      router.addRoute('/home', 'home-component', 'home');
      router.gotoPath('/home');

      expect(window.location.hash).toBe('#/home');
      const component = container.querySelector('home-component');
      expect(component).toBeTruthy();
    });

    it('should add a route and navigate to it with params in hash mode', () => {
      const { router, container } = InitiateRouter({ mode: 'hash' });
      router.addRoute('/user/:id', 'user-component', 'user');
      router.gotoPath('/user/123');

      expect(window.location.hash).toBe('#/user/123');
      const component = container.querySelector('user-component');
      expect(component).toBeTruthy();
      expect(component?.getAttribute('id')).toBe('123');
    });

    it('should add route and navigate to by name in hash mode', () => {
      const { router, container } = InitiateRouter({ mode: 'hash' });
      router.addRoute('/about', 'about-component', 'about');
      router.gotoName('about');

      expect(window.location.hash).toBe('#/about');
      const component = container.querySelector('about-component');
      expect(component).toBeTruthy();
    });

    it('should add a route and navigate to it by name with params in hash mode', () => {
      const { router, container } = InitiateRouter({ mode: 'hash' });
      router.addRoute('/product/:id', 'product-component', 'product');
      router.gotoName('product', { id: '456' });

      expect(window.location.hash).toBe('#/product/456');
      const component = container.querySelector('product-component');
      expect(component).toBeTruthy();
      expect(component?.getAttribute('id')).toBe('456');
    });

    describe('With Base URL', () => {
      it('should initialize with a base URL in hash mode', () => {
        const { router } = InitiateRouter({ baseUrl: '/app', mode: 'hash' });
        expect(router.config.baseUrl).toBe('/app');
      });

      it('should navigate to a route with base URL in hash mode', () => {
        const { router, container } = InitiateRouter({
          baseUrl: '/app',
          mode: 'hash',
        });
        router.addRoute('/dashboard', 'dashboard-component');
        router.gotoPath('/dashboard');

        expect(window.location.pathname).toBe('/app/');
        expect(window.location.hash).toBe('#/dashboard');
        const component = container.querySelector('dashboard-component');
        expect(component).toBeTruthy();
      });

      it('should navigate to a route by name with base URL in hash mode', () => {
        const { router, container } = InitiateRouter({
          baseUrl: '/app',
          mode: 'hash',
        });
        router.addRoute('/settings', 'settings-component', 'settings');
        router.gotoName('settings');

        expect(window.location.pathname).toBe('/app/');
        expect(window.location.hash).toBe('#/settings');
        const component = container.querySelector('settings-component');
        expect(component).toBeTruthy();
      });
    });
  });
});
