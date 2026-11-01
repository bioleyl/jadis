/** The places of the page's shell (`index.html`) that a render fills. */
export const SHELL_MARK = { body: '<!--app-body-->', head: '<!--app-head-->' } as const;

export const DEFAULT_OUT_DIR = { client: 'dist/client', server: 'dist/server' } as const;

/** Where the server entry is rebuilt in development, in the app's folder. */
export const DEV_SERVER_DIR = 'node_modules/.jadis-fastify';

export const INDEX_FILE = 'index.html';

/** Where Vite puts the built files the page loads: a path there that no file answers is a 404, not a page. */
export const ASSETS_PREFIX = '/assets/';

export const HTML_TYPE = 'text/html; charset=utf-8';

export const STATUS_OK = 200;
