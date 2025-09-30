import { beforeEach, describe, expect, it } from 'vitest';

import { RouteGroup } from './route-group';
import { Router } from './router';

import type { RouterOptions } from '../types/router.type';

const InitiateRouter = (options?: RouterOptions): { router: Router; container: HTMLDivElement } => {
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  document.body.innerHTML = '';
  document.body.appendChild(appContainer);

  const routerInstance = new Router(options);
  routerInstance.addRoute('/', 'base-page', { name: 'base' });
  routerInstance.mountOn(appContainer);

  return { container: appContainer, router: routerInstance };
};

describe('Route Group', () => {
  beforeEach(() => {
    // Reset the URL to root
    window.history.pushState({}, '', '/');
  });

  it('should add a route group and navigate to it', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(RouteGroup.create('group').addRoute('item', 'item-component', { name: 'item' }));

    router.gotoPath('/group/item');

    expect(window.location.pathname).toBe('/group/item');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
  });

  it('should add a route group with params and navigate to it', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(RouteGroup.create('group').addRoute('item/:id', 'item-component', { name: 'item' }));

    router.gotoPath('/group/item/456');

    expect(window.location.pathname).toBe('/group/item/456');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('456');
  });

  it('should add a route group and navigate to by name', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(RouteGroup.create('group').addRoute('item', 'item-component', { name: 'item' }));

    router.gotoName('item');

    expect(window.location.pathname).toBe('/group/item');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
  });

  it('should add a route group with params and navigate to by name', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(RouteGroup.create('group').addRoute('item/:id', 'item-component', { name: 'item' }));

    router.gotoName('item', { id: '456' });

    expect(window.location.pathname).toBe('/group/item/456');
    const component = container.querySelector('item-component');
    expect(component).toBeTruthy();
    expect(component?.getAttribute('id')).toBe('456');
  });

  it('should handle nested route groups with names', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group', { name: 'Main' })
        .addRoute('item', 'item-component', { name: 'item' })
        .addGroup(
          RouteGroup.create('subgroup', { name: 'Sub' }).addRoute('details', 'details-component', {
            name: 'Details',
          })
        )
    );

    router.gotoName('MainSubDetails');

    expect(window.location.pathname).toBe('/group/subgroup/details');
    const component = container.querySelector('details-component');
    expect(component).toBeTruthy();
  });

  it('should handle nested route groups with component selectors', () => {
    const { router, container } = InitiateRouter();
    router.addGroup(
      RouteGroup.create('group', {
        rootComponentSelector: 'main-component',
      }).addGroup(
        RouteGroup.create('subgroup', {
          rootComponentSelector: 'sub-component',
        }).addRoute('details', 'details-component')
      )
    );

    router.gotoPath('/group/subgroup/details');

    expect(window.location.pathname).toBe('/group/subgroup/details');
    const mainComponent = container.querySelector('main-component');
    expect(mainComponent).toBeTruthy();
    const subComponent = mainComponent?.querySelector('sub-component');
    expect(subComponent).toBeTruthy();
    const detailsComponent = subComponent?.querySelector('details-component');
    expect(detailsComponent).toBeTruthy();
  });
});
