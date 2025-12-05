import type { JadisConstructor } from '../base-component';
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
  readonly page: JadisConstructor<any>;
  /** Optional route options. */
  readonly options?: RouteOptions;
};

export interface RouterOptions {
  /** The mode of the router, either 'hash' or 'history'. */
  mode?: RouterMode;
  /** The base URL for the router, defaults to '/'. */
  baseUrl?: string;
}

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

export interface InternalRoute extends Route {
  regexp: RegExp;
}

export interface MatchedRoute extends InternalRoute {
  urlPath: string;
}

/** Extracts route parameters from a path literal */
export type ExtractParams<Path extends string> =
  Path extends `${string}${typeof ROUTER_PARAMETER_PREFIX}${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : Path extends `${string}${typeof ROUTER_PARAMETER_PREFIX}${infer Param}`
      ? { [K in Param]: string }
      : Record<never, never>;

/** Turn a union of object types into a single merged object type */
type Merge<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? { [K in keyof I]: I[K] }
  : never;

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
