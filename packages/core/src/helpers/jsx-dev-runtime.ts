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
  // biome-ignore lint/correctness/noUnusedFunctionParameters: required by jsxDEV signature
  key?: string | number,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: required by jsxDEV signature
  _isStaticChildren?: boolean,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: required by jsxDEV signature
  _source?: unknown,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: required by jsxDEV signature
  _self?: unknown
): Node {
  const mergedProps = key === undefined ? props : { ...(props ?? {}), key };
  return jsx(type as string, mergedProps as Record<string, unknown> | null | undefined);
}
