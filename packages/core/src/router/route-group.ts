import { normalizePath } from '../helpers/router.helper';
import { COMPONENT_SELECTOR_SEPARATOR } from './router-constants';

import type { Route, RouteOptions } from '../types/router.type';

export class RouteGroup {
  private readonly _routes: Array<Route> = [];
  private readonly _routePrefix: string;
  private readonly _namePrefix: string;
  private readonly _rootComponentSelector?: string | null;

  private constructor(routePrefix: string, options: RouteOptions = {}) {
    this._routePrefix = routePrefix;
    this._namePrefix = options.name ?? '';
    this._rootComponentSelector = options.rootComponentSelector ?? null;
  }

  /**
   * Creates a new RouteGroup instance.
   * @param {string} routePrefix The prefix for the route paths.
   * @param {RouteOptions} [options={}] - Optional route options including name and rootComponentSelector.
   * @returns {RouteGroup} A new RouteGroup instance.
   */
  static create(routePrefix: string, options?: RouteOptions): RouteGroup {
    return new RouteGroup(routePrefix, options);
  }

  /**
   * Returns the routes in the group.
   * @returns {Array<Route>} The routes in the group.
   */
  getRoutes(): Array<Route> {
    return this._routes;
  }

  /**
   * Adds a route to the group.
   * @param {string} path - The path of the route.
   * @param {string} componentSelector - The component selector for the route.
   * @param {RouteOptions} [options={}] - Optional route options.
   * @returns {RouteGroup} The current RouteGroup instance.
   */
  addRoute(path: string, componentSelector: string, options: RouteOptions = {}): this {
    this._routes.push({
      componentSelector: [this._rootComponentSelector, options.rootComponentSelector, componentSelector]
        .filter(Boolean)
        .join(COMPONENT_SELECTOR_SEPARATOR),
      name: options.name ? `${this._namePrefix}${options.name}` : undefined,
      path: normalizePath(`${this._routePrefix}/${path}`),
    });
    return this;
  }

  /**
   * Adds a group of routes to the current group.
   * @param {RouteGroup} group The route group to add.
   * @returns {RouteGroup} The current RouteGroup instance.
   */
  addGroup(group: RouteGroup): this {
    group.getRoutes().forEach(({ path, componentSelector, name }) => {
      this.addRoute(path, componentSelector, { name });
    });
    return this;
  }
}
