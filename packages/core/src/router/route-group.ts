import { normalizePath } from '../helpers/router.helper';

import type { Route } from '../types/router.type';

export class RouteGroup {
  private readonly _routes: Array<Route> = [];
  private readonly _routePrefix: string;
  private readonly _namePrefix: string;

  private constructor(routePrefix: string, namePrefix?: string) {
    this._routePrefix = routePrefix;
    this._namePrefix = namePrefix ?? '';
  }

  /**
   * Creates a new RouteGroup instance.
   * @param routePrefix The prefix for the route paths.
   * @param namePrefix The prefix for the route names.
   * @returns A new RouteGroup instance.
   */
  static create(routePrefix: string, namePrefix?: string): RouteGroup {
    return new RouteGroup(routePrefix, namePrefix);
  }

  getRoutes(): Array<Route> {
    return this._routes;
  }

  /**
   * Adds a route to the group.
   * @param path The path of the route.
   * @param componentSelector The component selector for the route.
   * @param name The name of the route.
   * @returns The current RouteGroup instance.
   */
  addRoute(path: string, componentSelector: string, name?: string) {
    this._routes.push({
      componentSelector,
      name: name ? `${this._namePrefix}${name}` : undefined,
      path: normalizePath(`${this._routePrefix}/${path}`),
    });
    return this;
  }

  /**
   * Adds a group of routes to the current group.
   * @param group The route group to add.
   * @returns The current RouteGroup instance.
   */
  addGroup(group: RouteGroup) {
    group.getRoutes().forEach(({ path, componentSelector, name }) => {
      this.addRoute(path, componentSelector, name);
    });
    return this;
  }
}
