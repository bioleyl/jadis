import { SHELL_MARK } from './plugin-constants.js';

import type { PageResponse } from './types/plugin.type.js';

/** The page's shell with the render in it. Replaced by functions: `$&` or `$'` in a page would read as patterns. */
export const pageHtml = (shell: string, response: PageResponse): string =>
  shell.replace(SHELL_MARK.head, () => response.head ?? '').replace(SHELL_MARK.body, () => response.body);

/** The file Vite's server build writes for an entry: `src/entry-server.tsx` gives `entry-server.js`. */
export const builtEntryName = (entry: string): string =>
  `${entry
    .split('/')
    .at(-1)
    ?.replace(/\.[cm]?[jt]sx?$/, '')}.js`;
