import type {
  FlattenRouteGroup,
  FlattenRoutes,
  Path,
  RouteDefinition,
  RouteOptions,
  RouteTree,
} from '../types/router.type';

export function isRouteDef(obj: any): obj is RouteDefinition {
  return obj && typeof obj.path === 'string' && typeof obj.page === 'function';
}

/**
 * Formats a URL path by normalizing slashes.
 * @param path The URL path to format.
 * @returns The formatted URL path.
 */
export function normalizePath(path: string): Path {
  return `/${path}`.replace(/\/{2,}/g, '/').replace(/(?<=.)\/$/, '') as Path;
}

function formatRouteKey<P extends string, K extends string>(prefix: P, key: K): string {
  return !prefix ? key : `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function flattenRoutes<const T extends Record<string, RouteDefinition | RouteTree>>(
  routes: T,
  prefix = ''
): Record<string, RouteDefinition> {
  const result: Record<string, RouteDefinition> = {};

  for (const [key, value] of Object.entries(routes)) {
    const nextKey = formatRouteKey(prefix, key);

    if (isRouteDef(value)) {
      result[nextKey] = {
        ...value,
        path: normalizePath(value.path),
      };
    } else {
      Object.assign(result, flattenRoutes(value, nextKey));
    }
  }

  return result;
}

/**
 * Defines routes by normalizing their paths.
 * @param routes A record of route definitions or nested route trees.
 * @returns A flattened and normalized route map.
 */
export function defineRoutes<const Tree extends Record<string, RouteDefinition | RouteTree>>(
  routes: Tree
): FlattenRoutes<Tree> {
  return flattenRoutes(routes) as FlattenRoutes<Tree>;
}

/**
 * Defines a route group with a common prefix.
 * @param prefix The common prefix for all routes in the group.
 * @param routes A record of route definitions or nested route trees.
 * @param options Optional route options to apply to all routes in the group.
 * @returns A new route tree with the prefix applied to all paths.
 */
export function defineRouteGroup<const Prefix extends Path, const Tree extends RouteTree>(
  prefix: Prefix,
  routes: Tree,
  options?: RouteOptions
): FlattenRouteGroup<Prefix, Tree> {
  const normalizedPrefix = normalizePath(prefix);

  return Object.fromEntries(
    Object.entries(routes).map(([key, value]) => {
      return isRouteDef(value)
        ? [
            key,
            {
              options: { ...options, ...value.options },
              page: value.page,
              path: `${normalizedPrefix}${value.path}` as const,
            },
          ]
        : [key, defineRouteGroup(normalizedPrefix, value, options)];
    })
  );
}
