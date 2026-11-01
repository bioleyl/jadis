# @jadis/fastify

Renders the pages of a Jadis app on a Fastify server. Every GET that no other route answers is a page. The app's
server entry renders it from the app's own routes, and the browser's router takes it over.

```ts
import jadis from '@jadis/fastify';

await app.register(api); // the app's own routes keep working as usual
await app.register(jadis, {
  dev: process.argv.includes('--dev') ? { vite: await import('vite') } : undefined,
  entry: 'src/entry-server.ts',
  preHandler: requireSession, // runs before a page renders: send a visitor without a session to the login page
  requestData: (request) => ({ cookie: request.headers.cookie ?? '' }),
  root: import.meta.dirname,
});
```

## What it does

- **Renders in worker threads.** Each worker has happy-dom as its DOM and its own copy of the app's modules.
  Fastify's thread never sees a `window`. Renders use several cores, and one request's render never shares a
  document or a module's state with another thread's. A worker that fails is replaced.
- **Fills the page's shell.** `index.html` holds `<!--app-head-->` and `<!--app-body-->`. The render's `head` and
  `body` go there, with its `status` and `headers`.
- **In production**, it serves the build: `dist/client` (each file a route, the shell excepted) and the server entry
  from `dist/server`.
- **In development** (`dev: { vite }`), Vite serves the browser's modules with hot reload, and the server entry is
  rebuilt on every change. Fresh workers take the next render.
- **Takes care of happy-dom's gaps:** a `part` token list, a `fetch` that refuses to run during a render (a
  component's data comes from the page's loader, before the render), and caches let go after each render.

## The server entry

It exports `render`: the page of a URL, given what `requestData` took from the request and Node's own `fetch`.

```ts
import { renderRoute } from '@jadis/core/server';
import type { RenderPage } from '@jadis/fastify';

export const render: RenderPage<RequestData> = async (url, request, server) => {
  const api = serverApi(server, request.cookie); // calls server.origin's API with the visitor's cookie
  const rendered = await renderRoute(routes, url, {
    prepare: (page, route) => (page as LoadingPage).load(route, api),
  });
  return rendered
    ? { body: rendered.body, headers: { 'cache-control': 'private, no-store' } }
    : { body: '', status: 404 };
};
```

`renderRoute` matches the URL with the router's own matching, and creates the elements the router would: the
group's root component, then the page, with the parameters as attributes. Values the page's attribute-bound fields
get in `prepare` go out in the markup. The browser's router finds these elements in its mount point and takes them
over instead of making the page again.

## Options

| Option | |
|---|---|
| `root` | The app's folder: its `index.html`, its Vite config, its build |
| `entry` | The server entry's source, from `root` |
| `dev` | `{ vite }`: the app's Vite module, for development |
| `outDir` | `{ client, server }`, from `root`: `dist/client` and `dist/server` by default |
| `workers` | How many renders run at once: one per core but one by default, one in development |
| `preHandler` | The page route's `preHandler` hook |
| `requestData` | What a render gets of the request: data only, as it crosses to a worker |
