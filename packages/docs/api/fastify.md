# @jadis/fastify

A [Fastify](https://fastify.dev) plugin that renders the pages of a *Jadis* app: every GET no other route answers is a page, rendered by the app's server entry in a worker thread, then put in the page's shell. See [An App on Fastify](../server-rendering/fastify.md).

```ts
import jadis from '@jadis/fastify';

await app.register(jadis, {
  dev: process.argv.includes('--dev') ? { vite: await import('vite') } : undefined,
  entry: 'src/entry-server.ts',
  root: import.meta.dirname,
});
```

## Options

| Option | Type | Description |
|---|---|---|
| `root` | `string` | The app's folder: its `index.html`, its Vite config, its build |
| `entry` | `string` | The server entry's source, from `root`; it exports a `RenderPage` as `render` |
| `dev` | `{ vite }` | Development: the app's Vite module (`await import('vite')`). Vite serves the browser's modules with hot reload; the server entry is rebuilt on every change |
| `outDir` | `{ client?, server? }` | The builds, from `root`: `dist/client` and `dist/server` by default |
| `workers` | `number` | How many renders run at once, each in a worker thread: one per core but one by default, one in development |
| `preHandler` | Fastify hook | The page route's `preHandler`: a hook that sends a visitor without a session to the login page |
| `requestData` | `(request) => RequestData` | What a render gets of the request: the cookie, the user. Data only: it crosses to a worker thread |

## The server entry

```ts
import type { RenderPage } from '@jadis/fastify';

export const render: RenderPage<RequestData> = async (url, request, server) => {
  // …
  return { body, head, status, headers };
};
```

```typescript
type RenderPage<RequestData = unknown> = (
  url: string,
  request: RequestData,
  server: ServerTools
) => Promise<PageResponse>;

interface ServerTools {
  /** Node's fetch: the global fetch is refused during a render. */
  fetch: typeof fetch;
  /** The server's own address, to call its API: http://localhost:3000 */
  origin: string;
}

interface PageResponse {
  /** In place of <!--app-body--> in the shell. */
  body: string;
  /** In place of <!--app-head-->: a title, meta tags. */
  head?: string;
  /** 200 by default. */
  status?: number;
  headers?: Record<string, string>;
}
```

## What the plugin takes care of

- **Worker threads.** Each worker has happy-dom as its DOM and its own copy of the app's modules: Fastify's thread never sees a `window`, renders use several cores, and one request's render never shares a document or a module's state with another thread's. A worker that fails is replaced; one that cannot load the server entry fails the renders with its error.
- **The shell.** `index.html` holds `<!--app-head-->` and `<!--app-body-->`; the plugin fills them. In development, Vite transforms the shell (its client, the modules' addresses).
- **The build's files.** In production, each file of `dist/client` is a route, the shell excepted; a path under `/assets/` that no file answers is a 404, not a page.
- **happy-dom's gaps.** A `part` token list on elements; a global `fetch` that refuses to run during a render; the document's query caches let go after each render.
