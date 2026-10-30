import { assert } from '../helpers/assert.helper';
import { applyElementAttributes, createElement } from '../helpers/element.helper';
import { normalizePath } from '../helpers/router.helper';
import { toKebabCase } from '../helpers/string.helper';
import {
  COMPONENT_SELECTOR_SEPARATOR,
  HISTORY_INDEX_KEY,
  QUERY_SEPARATOR,
  ROUTER_PARAMETER_PREFIX,
} from './router-constants';

import type { ParamsArgs } from '../helpers/type.helper';
import type {
  ActiveRoute,
  ExtractParams,
  InternalRoute,
  LeaveAnswer,
  MatchedRoute,
  MountedPage,
  RouteDefinition,
  RouterConfig,
  RouterMode,
  RouterOptions,
} from '../types/router.type';

const defaultOptions: RouterConfig = {
  baseUrl: '/',
  mode: 'history',
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** Whether a page's answer to leaving is still to come: it asks the person first. */
const isPending = (answer: LeaveAnswer | undefined): answer is Promise<boolean> => answer instanceof Promise;

/**
 * Router class for managing navigation and routing in a web application.
 * It supports both hash and history modes for navigation.
 * It allows defining routes, navigating to them, and mounting components based on the current URL.
 * A page that declares onRoute is kept while the routes stay on it; one that declares canLeave
 * can keep the person on it (see RoutedPage).
 */
export class Router<T extends Record<string, RouteDefinition>> {
  private readonly _routes: Array<InternalRoute> = [];
  private readonly _mode: RouterMode;
  private readonly _baseUrl: string;
  private readonly _parametersRegexp = new RegExp(`${ROUTER_PARAMETER_PREFIX}\\w+`, 'g');
  private _mount?: HTMLElement;
  private _currentRoute?: ActiveRoute;
  private _mountedPage?: MountedPage;
  /** The URL of the route shown: put back when the page refuses to be left. */
  private _shownUrl?: string;
  /** The number of the history entry shown: a refused change of URL goes back to it in the history. */
  private _shownIndex = 0;
  /** The router went back to the entry shown after a refusal: the popstate that follows is its own. */
  private _returning = false;
  /** Counts the navigations: an answer of canLeave that comes after a newer navigation is ignored. */
  private _leaveTicket = 0;

  constructor(routes: T, options?: RouterOptions) {
    this._mode = options?.mode ?? defaultOptions.mode;
    this._baseUrl = options?.baseUrl ?? defaultOptions.baseUrl;
    this._routes = Object.entries(routes).map(([name, def]) => this.toInternalRoute(name, def));

    window.addEventListener(
      this.eventName,
      (evt) => {
        evt.preventDefault();
        this.onUrlChange();
      },
      { signal: options?.signal }
    );
  }

  /**
   * Gets the router configuration.
   * @returns {RouterConfig} The router configuration including mode and baseUrl
   */
  get config(): RouterConfig {
    return {
      baseUrl: this._baseUrl,
      mode: this._mode,
    };
  }

  /**
   * Gets the current route, with its parameters and its query.
   * @throws Will throw an error if no route is found
   * @returns {ActiveRoute} The current route
   */
  get currentRoute(): ActiveRoute {
    assert(this._currentRoute, 'No route found');
    return this._currentRoute;
  }

  /**
   * Mounts the router on a specific HTML element.
   * @param {HTMLElement} el The element to mount the router on
   */
  mountOn(el: HTMLElement) {
    this._mount = el;
    this.markEntry(this.entryIndex() ?? 0);
    this.showRoute(this.matchCurrentUrl());
  }

  /**
   * Navigates to a route by its name, unless the current page refuses to be left.
   * @param {string} name The name of the route to navigate to
   * @param {Record<string, string>} [params] The parameters to include with the route
   */
  goto<K extends keyof T>(name: K, ...params: ParamsArgs<ExtractParams<T[K]['path']>>): void;
  goto(name: keyof T, params?: Record<string, string>) {
    const route = this.getRouteByName(String(name));
    assert(route, `No route found for name: ${String(name)}`);

    const path = this.buildPath(route.path, params);
    const next = this.matchPath(path, new URLSearchParams());
    this.leaveFor(next, () => {
      this.pushUrl(path);
      this.showRoute(next);
    });
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

  private toInternalRoute(name: string, def: RouteDefinition): InternalRoute {
    const path = normalizePath(`/${def.path}`);
    return {
      componentSelector: this.buildComponentSelector(def),
      name,
      path,
      regexp: this.buildPathRegexp(path),
    };
  }

  private buildComponentSelector(def: RouteDefinition): string {
    return [def.options?.rootComponentSelector, def.page.selector]
      .filter(Boolean)
      .join(COMPONENT_SELECTOR_SEPARATOR);
  }

  /** The regexp matching the path, each parameter capturing its value. */
  private buildPathRegexp(path: string): RegExp {
    const pathWithoutParameters = path.replace(this._parametersRegexp, '(.+)');
    return new RegExp(`^${pathWithoutParameters}$`);
  }

  /** The route of the current URL: its path, and its query (in hash mode, the hash's). */
  private matchCurrentUrl(): ActiveRoute {
    const [path, query] = this._mode === 'hash' ? this.readHashUrl() : this.readHistoryUrl();
    return this.matchPath(normalizePath(path), query);
  }

  private readHashUrl(): [string, URLSearchParams] {
    return this.splitPathAndQuery(window.location.hash.slice(1));
  }

  private readHistoryUrl(): [string, URLSearchParams] {
    return [this.stripBaseUrl(window.location.pathname), new URLSearchParams(window.location.search)];
  }

  private stripBaseUrl(pathname: string): string {
    return pathname.startsWith(this.baseUrl) ? pathname.slice(this.baseUrl.length) : pathname;
  }

  /** Splits a URL path from its query, at the first `?`. */
  private splitPathAndQuery(text: string): [string, URLSearchParams] {
    const index = text.indexOf(QUERY_SEPARATOR);
    return index === -1
      ? [text, new URLSearchParams()]
      : [text.slice(0, index), new URLSearchParams(text.slice(index))];
  }

  private pushUrl(path: string) {
    const urlPath = this._mode === 'hash' ? `#${path}` : path;
    this.pushEntry(normalizePath(`${this.baseUrl}/${urlPath}`));
  }

  /**
   * Adds a history entry after the current one, numbering the current one first: an entry the app pushed without a
   * popstate has no number yet, and the next entry's number must count it.
   */
  private pushEntry(url: string) {
    const index = this.currentEntryIndex();
    this.markEntry(index);
    window.history.pushState({ [HISTORY_INDEX_KEY]: index + 1 }, '', url);
  }

  /** The number the router gave the current history entry; none for an entry a link or the address bar added. */
  private entryIndex(): number | undefined {
    const state: unknown = window.history.state;
    const index = isRecord(state) ? state[HISTORY_INDEX_KEY] : undefined;
    return typeof index === 'number' ? index : undefined;
  }

  /** The number of the current history entry: one the router has not numbered was just added after the one shown. */
  private currentEntryIndex(): number {
    return this.entryIndex() ?? this._shownIndex + 1;
  }

  /** Numbers the current history entry, keeping the state the app put in it. */
  private markEntry(index: number) {
    const state: unknown = window.history.state;
    const kept = isRecord(state) ? state : {};
    window.history.replaceState({ ...kept, [HISTORY_INDEX_KEY]: index }, '', window.location.href);
  }

  private onUrlChange() {
    if (this._returning) {
      this.endReturn();
      return;
    }
    const next = this.matchCurrentUrl();
    if (!this.urlDiffersFromShown()) {
      this.showRoute(next);
      return;
    }
    const nextUrl = window.location.href;
    this.leaveFor(
      next,
      () => this.showUrl(nextUrl, next),
      () => this.returnToShown()
    );
  }

  /** Shows a route the URL went to, putting that URL back first if something changed it while the page asked. */
  private showUrl(url: string, next: ActiveRoute) {
    if (window.location.href !== url) {
      this.pushEntry(url);
    }
    this.showRoute(next);
  }

  /**
   * Takes the person back to the entry of the route shown after a refused change of URL: back or forward in the
   * history, so the entries stay as they were (an entry the router did not number was just added after the one
   * shown). When the entry did not change, the URL is put back.
   */
  private returnToShown() {
    const delta = this._shownIndex - this.currentEntryIndex();
    if (delta === 0) {
      this.restoreShownUrl();
      return;
    }
    this._returning = true;
    window.history.go(delta);
  }

  /**
   * Ends the way back to the entry shown. Should it land on another entry (the history holds entries the router could
   * not number), the URL shown is put back there rather than asking the page again, which could send the person back
   * and forth without end.
   */
  private endReturn() {
    this._returning = false;
    if (!this.urlDiffersFromShown()) {
      return;
    }
    this._shownIndex = this.currentEntryIndex();
    this.markEntry(this._shownIndex);
    this.restoreShownUrl();
  }

  private urlDiffersFromShown(): boolean {
    return window.location.href !== this._shownUrl;
  }

  /** Puts back the URL of the route shown, without adding a history entry. */
  private restoreShownUrl() {
    window.history.replaceState(window.history.state, '', this._shownUrl);
  }

  /**
   * Goes on to the next route (`go`) unless the mounted page refuses it (`stay`). A page that answers with a promise
   * stays while it asks, and the URL with it: a URL a link or the back button changed is left as it is meanwhile, so
   * going on adds nothing to the history, and is put back only when the answer is no. A promise that rejects keeps
   * the page. An answer that comes after a newer navigation is ignored.
   */
  private leaveFor(next: ActiveRoute, go: () => void, stay: () => void = () => undefined) {
    this._leaveTicket += 1;
    const ticket = this._leaveTicket;
    const answer = this._mountedPage?.page.canLeave?.(next);
    if (isPending(answer)) {
      answer.then(
        (leave) => this.settleLeave(ticket, leave ? go : stay),
        () => this.settleLeave(ticket, stay)
      );
      return;
    }
    const leaves = answer !== false;
    (leaves ? go : stay)();
  }

  /** Acts on a page's late answer to leaving, unless a newer navigation came while it asked. */
  private settleLeave(ticket: number, act: () => void) {
    if (ticket !== this._leaveTicket) {
      return;
    }
    act();
  }

  /** Shows the route: on the page mounted when it can follow it, else on a new one. */
  private showRoute(next: ActiveRoute) {
    this._currentRoute = next;
    this._shownIndex = this.currentEntryIndex();
    this.markEntry(this._shownIndex);
    this._shownUrl = window.location.href;
    this.sendRouteToPage(this.reuseMountedPage(next) ?? this.mountPage(next));
  }

  /** The page mounted, with the new parameters, when it is the route's page and follows routes itself. */
  private reuseMountedPage(next: ActiveRoute): MountedPage | undefined {
    const mounted = this._mountedPage;
    if (!mounted || !this.canReusePage(mounted, next)) {
      return undefined;
    }
    this.updatePageParams(mounted, next.params);
    return mounted;
  }

  /** Whether the mounted page is the route's page and follows routes itself. */
  private canReusePage(mounted: MountedPage, next: ActiveRoute): boolean {
    return mounted.componentSelector === next.componentSelector && typeof mounted.page.onRoute === 'function';
  }

  /** Sets the new parameters on the page's elements, removing those the route no longer has. */
  private updatePageParams(mounted: MountedPage, params: Record<string, string>) {
    const removedParams = Object.keys(mounted.params).filter((param) => !Object.hasOwn(params, param));
    for (const element of mounted.elements) {
      for (const param of removedParams) {
        element.removeAttribute(toKebabCase(param));
      }
      applyElementAttributes(element, params);
    }
    mounted.params = params;
  }

  private mountPage(next: ActiveRoute): MountedPage {
    const { componentSelector, params } = next;
    const elements = this.createPageElements(componentSelector, params);
    const [rootElement] = elements;
    const mounted: MountedPage = {
      componentSelector,
      connected: false,
      elements,
      page: elements.at(-1) ?? rootElement,
      params,
    };
    this._mountedPage = mounted;
    this.mountPoint.replaceChildren(rootElement);
    this.sendRouteOnceConnected(mounted);
    return mounted;
  }

  /** Creates the page's elements, from the root component down, each nested in the previous one. */
  private createPageElements(componentSelector: string, params: Record<string, string>): Array<HTMLElement> {
    const [rootComponent, ...childComponents] = componentSelector.split(COMPONENT_SELECTOR_SEPARATOR);
    const elements = [createElement(rootComponent, { attrs: params })];
    for (const selector of childComponents) {
      elements.push(createElement(selector, { attrs: params }, elements.at(-1)));
    }
    return elements;
  }

  private sendRouteOnceConnected(mounted: MountedPage) {
    // Jadis runs onConnect in the task after connecting: the page gets its route once it is wired.
    setTimeout(() => {
      mounted.connected = true;
      this.sendRouteToPage(mounted);
    });
  }

  /** Sends the current route to the mounted page's onRoute, once it is connected and while it is still shown. */
  private sendRouteToPage(mounted: MountedPage) {
    if (!mounted.connected || this._mountedPage !== mounted) {
      return;
    }
    mounted.page.onRoute?.(this.currentRoute);
  }

  private matchPath(urlPath: string, query: URLSearchParams): ActiveRoute {
    const route = this.getRouteByPath(urlPath);
    assert(route, `No route found for path: ${urlPath}`);
    const { componentSelector, name, path } = route;
    return { componentSelector, name, params: this.getRouteParameters({ ...route, urlPath }), path, query };
  }

  private buildPath(routePath: string, params: Record<string, string> = {}): string {
    const path = this.extractPathParams(routePath).reduce((acc, param) => {
      assert(Object.hasOwn(params, param), `Missing parameter "${param}" for path: ${routePath}`);
      return acc.replace(`${ROUTER_PARAMETER_PREFIX}${param}`, params[param]);
    }, routePath);
    return normalizePath(path);
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
