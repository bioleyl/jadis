import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyRequest, RouteShorthandOptions } from 'fastify';

/** What the server gives a render beside the request: Node's own fetch, and its own address for its API. */
export interface ServerTools {
  /** Node's fetch: the components' `fetch` is refused during a render, the page's data comes through here. */
  fetch: typeof fetch;
  /** The server's own address (`http://localhost:3000`), to call its API with the request's credentials. */
  origin: string;
}

/** What a render answers for a page: its HTML, and what goes with it. */
export interface PageResponse {
  /** Goes in place of `<!--app-body-->` in the page's shell. */
  body: string;
  /** Goes in place of `<!--app-head-->`: a title, meta tags. */
  head?: string;
  /** 200 by default. */
  status?: number;
  headers?: Record<string, string>;
}

/**
 * What the app's server entry exports as `render`: the page of a URL. It runs in a worker thread, where happy-dom is
 * the DOM, with the data `requestData` took from the request.
 */
export type RenderPage<RequestData = unknown> = (
  url: string,
  request: RequestData,
  server: ServerTools
) => Promise<PageResponse>;

/** What the plugin uses of Vite's development server. */
export interface ViteDevServer {
  middlewares: (request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void) => void;
  transformIndexHtml(url: string, html: string): Promise<string>;
  close(): Promise<void>;
}

/**
 * Vite's module, the app's own (`await import('vite')`), which the plugin uses in development only: what it calls of
 * it, so that any Vite version the app has fits.
 */
export interface ViteModule {
  createServer(config: object): Promise<ViteDevServer>;
  build(config: object): Promise<unknown>;
}

export interface JadisPluginOptions<RequestData = unknown> {
  /** The app's folder: its `index.html`, its Vite config, its build. */
  root: string;
  /** The server entry's source, from `root` (`src/entry-server.ts`); it exports a `RenderPage` as `render`. */
  entry: string;
  /**
   * Development: Vite serves the browser's modules (hot reload included) and rebuilds the server entry on every
   * change. Without it, the plugin serves the build of `outDir`.
   */
  dev?: { vite: ViteModule };
  /** The builds, from `root`: `dist/client` and `dist/server` by default. */
  outDir?: { client?: string; server?: string };
  /** How many renders run at once, each in a worker thread. One per core but one by default, one in development. */
  workers?: number;
  /**
   * Runs before a page renders, as the page route's `preHandler`: a hook that sends a visitor without a session to the
   * login page. The API's routes and the build's files keep their own hooks.
   */
  preHandler?: RouteShorthandOptions['preHandler'];
  /**
   * What a render gets of the request: the cookie that holds the session, the user. It crosses to a worker thread,
   * so it is data only (no functions, no class instances).
   */
  requestData?: (request: FastifyRequest) => RequestData;
}

/** A page to render, as it crosses to a worker. */
export interface RenderJob {
  url: string;
  request: unknown;
  origin: string;
}

/** What a worker sends back. */
export type WorkerMessage =
  | { kind: 'ready' }
  | { kind: 'done'; id: number; response: PageResponse }
  | { kind: 'failed'; id: number; error: string };

/** Where the page's shell and the server entry come from: the build, or Vite in development. */
export interface PageAssets {
  /** The page's shell for a URL, with `<!--app-head-->` and `<!--app-body-->` to fill. */
  shell(url: string): Promise<string>;
  /** The server entry, built. */
  entryFile: string;
  close(): Promise<void>;
}
