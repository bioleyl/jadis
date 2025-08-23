/**
 * Formats a URL path by normalizing slashes.
 * @param path The URL path to format.
 * @returns The formatted URL path.
 */
export const normalizePath = (path: string): string => {
  return `/${path}`.replace(/\/{2,}/g, '/').replace(/(?<=.)\/$/, '');
};
