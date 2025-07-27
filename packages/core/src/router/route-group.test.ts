import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from './router';
import { RouterOptions } from '../types/router.type';
import { RouteGroup } from './route-group';

const InitiateRouter = (
  options?: RouterOptions
): { router: Router; container: HTMLDivElement } => {
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  document.body.innerHTML = '';
  document.body.appendChild(appContainer);

  const routerInstance = new Router(options);
  routerInstance.addRoute('/', 'base-page', 'base');
  routerInstance.mountOn(appContainer);

  return { router: routerInstance, container: appContainer };
};

describe('Route Group', () => {
  beforeEach(() => {
    // Reset the URL to root
    window.history.pushState({}, '', '/');
  });

  it('should add a route group and navigate to it', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group').addRoute('/item', 'item-component', 'item')
    );

    router.gotoPath('/group/item');

    expect(window.location.pathname).toBe('/group/item');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
  });

  it('should add a route group with params and navigate to it', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group').addRoute('/item/:id', 'item-component', 'item')
    );

    router.gotoPath('/group/item/456');

    expect(window.location.pathname).toBe('/group/item/456');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('456');
  });

  it('should add a route group and navigate to by name', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group').addRoute('/item', 'item-component', 'item')
    );

    router.gotoName('item');

    expect(window.location.pathname).toBe('/group/item');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
  });

  it('should add a route group with params and navigate to by name', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group').addRoute('/item/:id', 'item-component', 'item')
    );

    router.gotoName('item', { id: '456' });

    expect(window.location.pathname).toBe('/group/item/456');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('456');
  });

  it('should handle nested route groups with names', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group', 'Main')
        .addRoute('/item', 'item-component', 'item')
        .addGroup(
          RouteGroup.create('subgroup', 'Sub').addRoute(
            '/details',
            'details-component',
            'Details'
          )
        )
    );

    router.gotoName('MainSubDetails');

    expect(window.location.pathname).toBe('/group/subgroup/details');
    const component = container.querySelector('details-component');
    expect(component).toBeTruthy();
  });
});
