import { assert } from '../helpers/assert.helper';
import { createElement } from '../helpers/element.helper';
import { normalizePath } from '../helpers/router.helper';
import { COMPONENT_SELECTOR_SEPARATOR, ROUTER_PARAMETER_PREFIX } from './router-constants';

import type {
  ExtractParams,
  InternalRoute,
  MatchedRoute,
  Route,
  RouteDef,
  RouterMode,
  RouterOptions,
} from '../types/router.type';

const defaultOptions: Required<RouterOptions> = {
  baseUrl: '/',
  mode: 'history',
};

/**
 * Router class for managing navigation and routing in a web application.
 * It supports both hash and history modes for navigation.
 * It allows defining routes, navigating to them, and mounting components based on the current URL.
 */
export class Router<T extends Record<string, RouteDef>> {
  private readonly _routes: Array<InternalRoute> = [];
  private readonly _mode: RouterMode;
  private readonly _baseUrl: string;
  private readonly _parametersRegexp = new RegExp(`${ROUTER_PARAMETER_PREFIX}\\w+`, 'g');
  private _mount?: HTMLElement;
  private _currentRoute?: Route;

  constructor(routes: T, options?: RouterOptions) {
    this._mode = options?.mode ?? defaultOptions.mode;
    this._baseUrl = options?.baseUrl ?? defaultOptions.baseUrl;
    this._routes = Object.entries(routes).map(([name, def]) => {
      const path = normalizePath(`/${def.path}`);
      const pathWithoutParameters = path.replace(this._parametersRegexp, '(.+)');
      return {
        componentSelector: [def.options?.rootComponentSelector, def.page().selector]
          .filter(Boolean)
          .join(COMPONENT_SELECTOR_SEPARATOR),
        name,
        path,
        regexp: new RegExp(`^${pathWithoutParameters}$`),
      };
    });

    window.addEventListener(this.eventName, (evt) => {
      evt.preventDefault();
      this.onUrlChange();
    });
  }

  /**
   * Gets the router configuration.
   * @returns {Required<RouterOptions>} The router configuration including mode and baseUrl
   */
  get config(): Required<RouterOptions> {
    return {
      baseUrl: this._baseUrl,
      mode: this._mode,
    };
  }

  /**
   * Gets the current route.
   * @throws Will throw an error if no route is found
   * @returns {Route} The current route
   */
  get currentRoute(): Route {
    assert(this._currentRoute, 'No route found');
    return this._currentRoute;
  }

  /**
   * Mounts the router on a specific HTML element.
   * @param {HTMLElement} el The element to mount the router on
   */
  mountOn(el: HTMLElement) {
    this._mount = el;
    this.onUrlChange();
  }

  /**
   * Navigates to a route by its name.
   * @param {string} name The name of the route to navigate to
   * @param {Record<string, string>} [params] The parameters to include with the route
   */
  goto<K extends keyof T>(name: K & (keyof ExtractParams<T[K]['path']> extends never ? K : never)): void;
  goto<K extends keyof T>(
    name: K & (keyof ExtractParams<T[K]['path']> extends never ? never : K),
    params: ExtractParams<T[K]['path']>
  ): void;
  goto(name: keyof T, params?: Record<string, string>) {
    const route = this.getRouteByName(String(name));
    assert(route, `No route found for name: ${String(name)}`);

    this.gotoPath(this.buildPath(route.path, params));
  }

  private gotoPath(path: string) {
    const urlPath = this._mode === 'hash' ? `#${path}` : path;
    window.history.pushState({}, '', normalizePath(`${this.baseUrl}/${urlPath}`));
    this.onUrlChange();
  }

  private get baseUrl(): string {
    return normalizePath(this._baseUrl);
  }

  private get mountPoint(): HTMLElement {
    assert(this._mount, 'No mount point defined');
    return this._mount;
  }

  private get eventName() {
    return this._mode === 'hash' ? 'hashchange' : 'popstate';
  }

  private get currentUrlPath() {
    const formattedPath = window.location.pathname.startsWith(this.baseUrl)
      ? window.location.pathname.slice(this.baseUrl.length)
      : window.location.pathname;
    const path = this._mode === 'hash' ? window.location.hash.slice(1) : formattedPath;
    return normalizePath(path);
  }

  private onUrlChange() {
    const urlPath = this.currentUrlPath;

    const matchedRoute = this.getRouteByPath(urlPath);
    assert(matchedRoute, `No route found for path: ${urlPath}`);
    this._currentRoute = matchedRoute;

    const component = this.getComponentToLoad({ ...matchedRoute, urlPath });
    this.mountPoint.replaceChildren(component);
  }

  private buildPath(routePath: string, params: Record<string, string> = {}): string {
    const path = this.extractPathParams(routePath).reduce((acc, param) => {
      assert(Object.hasOwn(params, param), `Missing parameter "${param}" for path: ${routePath}`);
      return acc.replace(`${ROUTER_PARAMETER_PREFIX}${param}`, params[param]);
    }, routePath);
    return normalizePath(path);
  }

  private getComponentToLoad(matchedRoute: MatchedRoute): Node {
    const { componentSelector } = matchedRoute;
    const params = this.getRouteParameters(matchedRoute);

    const [rootComponent, ...childComponents] = componentSelector.split(COMPONENT_SELECTOR_SEPARATOR);
    const rootElement = createElement(rootComponent, { attrs: params });
    childComponents.reduce((parent, selector) => createElement(selector, { attrs: params }, parent), rootElement);
    return rootElement;
  }

  private getRouteParameters(matchedRoute: MatchedRoute): Record<string, string> {
    const { urlPath, regexp, path } = matchedRoute;

    const match = regexp.exec(urlPath);
    assert(match, `No match found for path: ${urlPath}`);

    return this.extractPathParams(path).reduce<Record<string, string>>((acc, param, index) => {
      acc[param] = match[index + 1];
      return acc;
    }, {});
  }

  private getRouteByName(name: string): InternalRoute | null {
    return this._routes.find(({ name: routeName }) => routeName === name) ?? null;
  }

  private getRouteByPath(path: string): InternalRoute | null {
    return this._routes.find(({ regexp }) => regexp.test(path)) ?? null;
  }

  private extractPathParams(path: string): Array<string> {
    return path.split('/').reduce<Array<string>>((acc, part) => {
      if (part.startsWith(ROUTER_PARAMETER_PREFIX)) {
        acc.push(part.slice(ROUTER_PARAMETER_PREFIX.length));
      }
      return acc;
    }, []);
  }
}
