import { Fragment, jsx } from './jsx-runtime';

import type { JSX } from './jsx-runtime';

export { Fragment, type JSX };

/**
 * JSX DEV runtime — used in development builds.
 * Delegates to the production `jsx` but merges `key` into props
 * for React DevTools compatibility.
 */
export function jsxDEV(
  type: string | import('../base-component').JadisConstructor,
  props: Record<string, unknown> | null | undefined,
  key?: string | number,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown
): Node {
  const mergedProps = key === undefined ? props : { ...(props ?? {}), key };
  return jsx(type as string, mergedProps as Record<string, unknown> | null | undefined);
}
