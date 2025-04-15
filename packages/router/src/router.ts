import { assert, createElement } from '@jadis/helpers';
import {
  InternalRoute,
  MatchedRoute,
  Route,
  RouterMode,
  RouterOptions,
} from './types/router.type';

const ROUTER_PARAMETER_PREFIX = ':';

const defaultOptions: Required<RouterOptions> = {
  mode: 'history',
};

export class Router {
  private readonly _routes: Array<InternalRoute> = [];
  private readonly _mode: RouterMode;
  private readonly _parametersRegexp = new RegExp(
    `${ROUTER_PARAMETER_PREFIX}\\w+`,
    'g'
  );
  private _mount?: HTMLElement;
  private _currentRoute?: Route;

  constructor(options?: RouterOptions) {
    this._mode = options?.mode ?? defaultOptions.mode;

    window.addEventListener(this.eventName, (evt) => {
      evt.preventDefault();
      this.onUrlChange();
    });
  }

  get currentRoute(): Route {
    assert(this._currentRoute, 'No route found');
    return this._currentRoute;
  }

  addRoute(path: string, componentSelector: string, name?: string) {
    const pathWithoutParameters = path.replace(this._parametersRegexp, '(.+)');
    this._routes.push({
      name,
      path,
      componentSelector,
      regexp: new RegExp(`^${pathWithoutParameters}$`),
    });
  }

  mountOn(el: HTMLElement) {
    this._mount = el;
    this.onUrlChange();
  }

  gotoName(name: string, params?: Record<string, string>) {
    const route = this.getRouteByName(name);
    assert(route, `No route found for name: ${name}`);

    this.gotoPath(this.formatPath(route.path, params));
  }

  gotoPath(path: string) {
    const urlPath = this._mode === 'hash' ? `#${path}` : path;
    window.history.pushState({}, '', urlPath);
    this.onUrlChange();
  }

  private get mountPoint(): HTMLElement {
    assert(this._mount, 'No mount point defined');
    return this._mount;
  }

  private get eventName() {
    return this._mode === 'hash' ? 'hashchange' : 'popstate';
  }

  private get currentUrlPath() {
    const path =
      this._mode === 'hash'
        ? window.location.hash.slice(1)
        : window.location.pathname;
    return path.startsWith('/') ? path : `/${path}`;
  }

  private onUrlChange() {
    const urlPath = this.currentUrlPath;

    const matchedRoute = this.getRouteByPath(urlPath);
    assert(matchedRoute, `No route found for path: ${urlPath}`);
    this._currentRoute = matchedRoute;

    const component = this.getComponentToLoad({ ...matchedRoute, urlPath });
    this.mountPoint.replaceChildren(component);
  }

  private formatPath(
    routePath: string,
    params: Record<string, string> = {}
  ): string {
    return this.extractPathParams(routePath).reduce((acc, param) => {
      assert(
        params.hasOwnProperty(param),
        `Missing parameter "${param}" for path: ${routePath}`
      );
      return acc.replace(`${ROUTER_PARAMETER_PREFIX}${param}`, params[param]);
    }, routePath);
  }

  private getComponentToLoad(matchedRoute: MatchedRoute): Node {
    const { componentSelector } = matchedRoute;
    const params = this.getRouteParameters(matchedRoute);

    return createElement(componentSelector, params);
  }

  private getRouteParameters(
    matchedRoute: MatchedRoute
  ): Record<string, string> {
    const { urlPath, regexp, path } = matchedRoute;

    const match = regexp.exec(urlPath);
    assert(match, `No match found for path: ${urlPath}`);

    return this.extractPathParams(path).reduce(
      (acc, param, index) => {
        return { ...acc, [param]: match[index + 1] };
      },
      {} as Record<string, string>
    );
  }

  private getRouteByName(name: string): InternalRoute | null {
    return (
      this._routes.find(({ name: routeName }) => routeName === name) ?? null
    );
  }

  private getRouteByPath(path: string): InternalRoute | null {
    return this._routes.find(({ regexp }) => regexp.test(path)) ?? null;
  }

  private extractPathParams(path: string): Array<string> {
    return path.split('/').reduce((acc, part) => {
      return part.startsWith(ROUTER_PARAMETER_PREFIX)
        ? [...acc, part.slice(ROUTER_PARAMETER_PREFIX.length)]
        : acc;
    }, [] as Array<string>);
  }
}
