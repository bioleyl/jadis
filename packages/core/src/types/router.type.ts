import type { JadisConstructor } from '../base-component';
import type { ROUTER_PARAMETER_PREFIX } from '../router/router-constants';

export type Path = `/${string}`;
export type RouterMode = 'hash' | 'history';

export type RouteTree = {
  readonly [key: string]: RouteDef | RouteTree;
};

export type RouteDef = {
  /** The path for the route. */
  readonly path: Path;
  /** The page component constructor for the route. */
  readonly page: () => JadisConstructor<any>;
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

/** Extracts route parameters from a path string */
export type ExtractParams<S extends string> =
  S extends `${string}${typeof ROUTER_PARAMETER_PREFIX}${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : S extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<never, never>;

/** Turn a union of object types into a single merged object type */
type Merge<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? { [K in keyof I]: I[K] }
  : never;

/** Flatten a nested route tree into a single-level route map */
export type Flatten<T, Prefix extends string = ''> = Merge<
  {
    [K in keyof T]: T[K] extends RouteDef
      ? {
          readonly [P in Prefix extends '' ? `${string & K}` : `${Prefix}${Capitalize<string & K>}`]: T[K];
        }
      : T[K] extends Record<string, unknown>
        ? Flatten<T[K], Prefix extends '' ? `${string & K}` : `${Prefix}${Capitalize<string & K>}`>
        : never;
  }[keyof T]
>;

/** Remove trailing slash from a string literal */
type TrimTrailingSlash<S extends string> = S extends `${infer Rest}/` ? Rest : S;

/** Adds a prefix to all paths in a route tree */
export type WithPrefix<Prefix extends string, T extends RouteTree> = {
  readonly [K in keyof T]: T[K] extends RouteDef
    ? {
        readonly path: `${TrimTrailingSlash<Prefix>}${T[K]['path']}`;
        readonly page: T[K]['page'];
        options?: RouteOptions;
      }
    : T[K] extends RouteTree
      ? WithPrefix<Prefix, T[K]>
      : never;
};
