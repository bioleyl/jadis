import type { Flatten, Path, RouteDef, RouteOptions, RouteTree, WithPrefix } from '../types/router.type';

export function isRouteDef(obj: any): obj is RouteDef {
  return obj && typeof obj.path === 'string' && typeof obj.page === 'function';
}

/**
 * Formats a URL path by normalizing slashes.
 * @param path The URL path to format.
 * @returns The formatted URL path.
 */
export const normalizePath = (path: string): Path => {
  return `/${path}`.replace(/\/{2,}/g, '/').replace(/(?<=.)\/$/, '') as Path;
};

function formatRouteKey<P extends string, K extends string>(prefix: P, key: K): string {
  return !prefix ? key : `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function flattenTree<const T extends Record<string, RouteDef | RouteTree>>(
  routes: T,
  prefix = ''
): Record<string, RouteDef> {
  const result: Record<string, RouteDef> = {};

  for (const [key, value] of Object.entries(routes)) {
    const nextKey = formatRouteKey(prefix, key);

    if (isRouteDef(value)) {
      result[nextKey] = {
        ...value,
        path: normalizePath(value.path),
      };
    } else {
      Object.assign(result, flattenTree(value, nextKey));
    }
  }

  return result;
}

/**
 * Defines routes by normalizing their paths.
 * @param routes A record of route definitions or nested route trees.
 * @returns A flattened and normalized route map.
 */
export function defineRoutes<const T extends Record<string, RouteDef | RouteTree>>(routes: T): Flatten<T> {
  return flattenTree(routes) as Flatten<T>;
}

/**
 * Defines a route group with a common prefix.
 * @param prefix The common prefix for all routes in the group.
 * @param routes A record of route definitions or nested route trees.
 * @param options Optional route options to apply to all routes in the group.
 * @returns A new route tree with the prefix applied to all paths.
 */
export function defineRouteGroup<const Prefix extends Path, const T extends RouteTree>(
  prefix: Prefix,
  routes: T,
  options?: RouteOptions
): WithPrefix<Prefix, T> {
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
