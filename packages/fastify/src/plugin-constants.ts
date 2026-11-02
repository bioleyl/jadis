/** The places of the page's shell (`index.html`) that a render fills. */
export const SHELL_MARK = { body: '<!--app-body-->', head: '<!--app-head-->' } as const;

export const DEFAULT_OUT_DIR = { client: 'dist/client', server: 'dist/server' } as const;

/** Where the server entry is rebuilt in development, in the app's folder. */
export const DEV_SERVER_DIR = 'node_modules/.jadis-fastify';

export const INDEX_FILE = 'index.html';

/** Where Vite puts the built files the page loads: a path there that no file answers is a 404, not a page. */
export const ASSETS_PREFIX = '/assets/';

/** Where the plugin serves the stylesheets renders link to, each named after a hash of its CSS. */
export const STYLES_PREFIX = '/_jadis/styles/';

/** How many characters of a stylesheet's hash name its file. */
export const STYLE_HASH_LENGTH = 16;

/** A stylesheet's address changes with its CSS: the browser keeps each file a year without asking again. */
export const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

export const HTML_TYPE = 'text/html; charset=utf-8';

export const CSS_TYPE = 'text/css; charset=utf-8';

export const STATUS_OK = 200;
