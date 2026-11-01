# An App on Fastify

This page sets up a *Jadis* app rendered by [Fastify](https://fastify.dev), with `@jadis/fastify`. The code comes from the [cooking example](https://github.com/bioleyl/jadis-examples/tree/main/packages/cooking-ssr).

To start from a project that has all of it, use the boilerplate:

```bash
npx @jadis/create ssr my-app
cd my-app
npm install
npm run dev
```

## The files

```
index.html              the page's shell
vite.config.ts          two builds: the browser's and the server's
server/main.ts          Fastify: the API, then the plugin
src/routes.ts           the app's one route table
src/entry-server.ts     the page of a URL, on the server
src/entry-client.ts     the router, in the browser
src/pages/…             the pages, which load their own data
```

## Install

```bash
npm install @jadis/core @jadis/fastify fastify
npm install -D vite typescript @types/node
```

```json
{
  "scripts": {
    "dev": "node server/main.ts --dev",
    "build": "tsc && vite build && vite build --ssr src/entry-server.ts",
    "start": "node server/main.ts"
  }
}
```

Node runs `server/main.ts` as it is: it strips the types itself, so the server's TypeScript uses erasable syntax only and imports with `.ts` extensions.

## The page's shell: `index.html`

The plugin fills two places: `<!--app-head-->` (the page's title) and `<!--app-body-->` (the page), inside the element the router mounts on.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--app-head-->
    <link rel="stylesheet" href="/src/page.css" />
    <script type="module" src="/src/entry-client.ts"></script>
  </head>
  <body>
    <div id="app"><!--app-body--></div>
  </body>
</html>
```

The styles the page needs before its components (fonts, the page's background, a design system's custom properties) go in a stylesheet linked here: the first paint has them.

## Two builds: `vite.config.ts`

```ts
export default ({ isSsrBuild }: { isSsrBuild?: boolean }) => ({
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
  },
  // The server bundle holds the app's code and Jadis: the plugin's workers set up the DOM before loading it.
  ssr: { noExternal: true },
});
```

`dist/client` is what the browser loads; `dist/server/entry-server.js` is what the plugin's workers load. Both are the plugin's defaults.

## The route table: `src/routes.ts`

The same table for the browser's router and for the server. A group gives its pages a frame, the root component, here the site's header.

```ts
import { defineRouteGroup, defineRoutes } from '@jadis/core';

export const routes = defineRoutes({
  ...defineRouteGroup(
    '/',
    {
      recipe: { page: RecipePage, path: '/recipes/:slug' },
      recipes: { page: RecipesPage, path: '/' },
    },
    { rootComponentSelector: SiteRoot.selector }
  ),
  notFound: { page: NotFoundPage, path: '/:rest' },
});
```

Use history mode (the default): the server sees the path. A hash never reaches it.

## The server: `server/main.ts`

```ts
import { join } from 'node:path';

import jadis from '@jadis/fastify';
import Fastify from 'fastify';

const app = Fastify({ logger: true });

// The API: what the pages fetch, in the browser and in a server render alike.
app.get('/api/recipes', async (request) => searchRecipes(request.query));
app.get('/api/recipes/:slug', async (request, reply) => findRecipe(request.params) ?? reply.code(404).send());

// Every other GET is a page.
await app.register(jadis, {
  dev: process.argv.includes('--dev') ? { vite: await import('vite') } : undefined,
  entry: 'src/entry-server.ts',
  root: join(import.meta.dirname, '..'),
});

await app.listen({ port: 3000 });
```

The plugin registers a route for every GET that no other route answers. Register the app's own routes as usual: they keep working, the plugin only takes the rest.

- **In development** (`dev: { vite }`), Vite serves the browser's modules with hot reload, and the server entry is rebuilt on every change: the next render uses it.
- **In production**, the plugin serves `dist/client` (each file a route, the shell excepted) and renders with `dist/server`.

## The server entry: `src/entry-server.ts`

It exports `render`: the page of a URL. The plugin calls it in a worker thread, where happy-dom is the DOM.

```ts
import { renderRoute } from '@jadis/core/server';

import type { RenderPage } from '@jadis/fastify';

export const render: RenderPage = async (url, _request, server) => {
  const api = serverApi(server);
  const rendered = await renderRoute(routes, url, {
    // The page loads what it shows before the render: its data goes out in the markup.
    prepare: async (page, route) => (loads(page) ? page.load(route, api) : undefined),
  });
  if (!rendered) {
    return { body: '', status: 404 };
  }
  return {
    body: rendered.body,
    head: `<title>${titleOf(rendered)}</title>`,
    headers: { 'cache-control': 'public, max-age=60' },
    status: rendered.route.name === 'notFound' ? 404 : 200,
  };
};
```

`renderRoute` matches the URL in the route table with the router's own matching, creates what the router would (`<site-root slug="pancakes"><recipe-page slug="pancakes">`), lets `prepare` give the page its data, renders, and writes it. [Data and Responses](./data.md) covers `load`, the status and the title.

## The browser's entry: `src/entry-client.ts`

```ts
import { Router } from '@jadis/core';

import { routes } from './routes';

const app = document.getElementById('app');
if (app) {
  new Router(routes, { links: true }).mountOn(app);
}
```

`mountOn` finds the page the server rendered in `#app` (`site-root > recipe-page`), and keeps it as the page shown instead of making it again. The links to the app's routes are followed without a page load (`links: true`), and every next page is the router's.

Importing `routes` imports the pages, which define their components: the server's elements upgrade at that moment, before the router mounts.

## Run it

```bash
npm run dev                 # http://localhost:3000
npm run build && npm start
```

Turn JavaScript off in the browser: the pages still show, links are plain links, and a `<form method="get">` is a plain form the server answers.
