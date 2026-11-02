import { createHash } from 'node:crypto';

import { STYLE_HASH_LENGTH, STYLES_PREFIX } from './plugin-constants.js';

import type { StyleCollector } from './types/plugin.type.js';

/** The address of a stylesheet's file: a hash of its CSS, so that a change makes a new file and never a stale one. */
export const styleAddress = (css: string): string =>
  `${STYLES_PREFIX}${createHash('sha256').update(css).digest('base64url').slice(0, STYLE_HASH_LENGTH)}.css`;

/**
 * Preloads of a page's stylesheets, for its head: a stylesheet linked from a shadow root is only found as the body is
 * read, and the page's first paint waits for it.
 */
export const stylePreloads = (addresses: string[]): string =>
  addresses.map((address) => `<link rel="preload" as="style" href="${address}">`).join('');

/** Collects the stylesheets of one render: each CSS the render links to, by its file's address. */
export function collectStyles(): StyleCollector {
  const files: StyleCollector['files'] = {};
  return {
    files,
    styles: (css) => {
      const address = styleAddress(css);
      files[address] = css;
      return address;
    },
  };
}
