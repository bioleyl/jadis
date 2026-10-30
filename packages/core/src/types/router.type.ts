import type { JadisConstructor } from '../base-component';
import type { Merge } from '../helpers/type.helper';
import type { ROUTER_PARAMETER_PREFIX } from '../router/router-constants';

/** Remove trailing slash from a string literal */
type TrimTrailingSlash<S extends string> = S extends `${infer Rest}/` ? Rest : S;

export type Path = `/${string}`;
export type RouterMode = 'hash' | 'history';

export type RouteTree = {
  readonly [key: string]: RouteDefinition | RouteTree;
};

export type RouteDefinition = {
  /** The path for the route. */
  readonly path: Path;
  /** The page component constructor for the route. */
  readonly page: JadisConstructor;
  /** Optional route options. */
  readonly options?: RouteOptions;
};

export interface RouterOptions {
  /** The mode of the router, either 'hash' or 'history'. */
  mode?: RouterMode;
  /** The base URL for the router, defaults to '/'. */
  baseUrl?: string;
  /** Stops the router from following the URL once aborted. */
  signal?: AbortSignal;
}

/** The router's configuration, as `config` gives it back. */
export type RouterConfig = Required<Omit<RouterOptions, 'signal'>>;

export interface RouteOptions {
  /** The prefix for the route names in the group. */
  name?: string;
  /** The component selector for the route group, if applicable. */
  rootComponentSelector?: string;
}

export interface Route {
  name: string;
  path: Path;
  componentSelector: string;
}

/** The route the URL is on: its parameters, and its query. */
export interface ActiveRoute extends Route {
  /** The path parameters read from the URL, by their names in the route's path. */
  params: Record<string, string>;
  /** The query of the URL; in hash mode, the part of the hash after `?`. */
  query: URLSearchParams;
}

/**
 * What a page component can declare to work with the router. Both are optional:
 * a page without onRoute is made again at each navigation.
 */
export interface RoutedPage {
  /**
   * Called with the route once the page is connected (after its onConnect), then at each
   * URL change whose route is on the same page: the router keeps the page instead of making it again.
   */
  onRoute?(route: ActiveRoute): void;
  /**
   * Called before the URL changes; false keeps the page, and puts the URL back. A promise (the page asks the
   * person first) keeps the page and its URL until it settles, then goes on to `next` if it resolves to true.
   */
  canLeave?(next: ActiveRoute): LeaveAnswer;
}

/** What a page answers when the person would leave it: at once, or once it has asked them. */
export type LeaveAnswer = boolean | Promise<boolean>;

export interface InternalRoute extends Route {
  regexp: RegExp;
}

export interface MatchedRoute extends InternalRoute {
  urlPath: string;
}

/** What the router mounted for a route: the elements from the root component to the page. */
export interface MountedPage {
  componentSelector: string;
  elements: HTMLElement[];
  page: HTMLElement & RoutedPage;
  /** The parameters set as attributes on the elements. */
  params: Record<string, string>;
  /** Whether the page's onConnect has run: until then, the route waits to be given to it. */
  connected: boolean;
}

/** Extracts route parameters from a path literal */
export type ExtractParams<Path extends string> =
  Path extends `${string}${typeof ROUTER_PARAMETER_PREFIX}${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : Path extends `${string}${typeof ROUTER_PARAMETER_PREFIX}${infer Param}`
      ? { [K in Param]: string }
      : Record<never, never>;

/** Flatten a nested route tree into a single-level route map */
export type FlattenRoutes<Tree, Prefix extends string = ''> = Merge<
  {
    [K in keyof Tree]: Tree[K] extends RouteDefinition
      ? {
          readonly [P in Prefix extends '' ? `${string & K}` : `${Prefix}${Capitalize<string & K>}`]: Tree[K];
        }
      : Tree[K] extends Record<string, unknown>
        ? FlattenRoutes<Tree[K], Prefix extends '' ? `${string & K}` : `${Prefix}${Capitalize<string & K>}`>
        : never;
  }[keyof Tree]
>;

/** Adds a prefix to all paths in a route group tree */
export type FlattenRouteGroup<Prefix extends string, Tree extends RouteTree> = {
  readonly [K in keyof Tree]: Tree[K] extends RouteDefinition
    ? {
        readonly path: `${TrimTrailingSlash<Prefix>}${Tree[K]['path']}`;
        readonly page: Tree[K]['page'];
        options?: RouteOptions;
      }
    : Tree[K] extends RouteTree
      ? FlattenRouteGroup<Prefix, Tree[K]>
      : never;
};
