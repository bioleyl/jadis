# Server rendering

`@jadis/core/server` renders components to HTML in a server-side DOM (happy-dom). `@jadis/fastify` hosts it on Fastify. The browser paints the HTML before any script, then each component takes its element over and the router takes the page over. Full guide, at the installed version: `server-rendering/overview.md` and the pages beside it in the docs.

## Contents

- How it works
- Start from the scaffold
- The files
- A page that loads its data
- State travels in attributes
- What code must give back
- Rules on the server
- Limits and troubleshooting
- Without Fastify

## How it works

1. A GET that no Fastify route answers is a page. The plugin calls the app's server entry in a worker thread, where happy-dom is the DOM.
2. `renderRoute(routes, url, { prepare })` matches the URL in the app's own route table, creates what the router would (root component, then page, parameters as attributes), lets `prepare` load the page's data, waits for the components to connect, and writes HTML.
3. Each open shadow root is written as declarative shadow DOM (`<template shadowrootmode="open">`), its styles inside: the browser paints it before any script.
4. When a component's definition loads, its constructor gets the declarative shadow root **emptied**, and its connection renders the template again from the element's **attributes**, in the same task: nothing flashes. This is not hydration: no server node is reused.
5. `router.mountOn()` finds that route's elements in its mount point and keeps them as the page shown; every next page is the router's.

It gives a first paint without JavaScript and pages search engines read. It does not make the page interactive sooner: the code to load is the same.

## Start from the scaffold

```bash
npx @jadis/create ssr my-app
cd my-app && npm install && npm run dev      # http://localhost:3000
npm run build && npm start                   # production
```

## The files

```
index.html             the shell: <!--app-head--> and <!--app-body--> inside the router's mount point
vite.config.ts         two builds: dist/client for the browser, dist/server for the workers (ssr.noExternal: true)
server/main.ts         Fastify: the API routes, then the plugin
src/routes.ts          the one route table, used by the browser's router and the server
src/entry-server.ts    exports render: the page of a URL
src/entry-client.ts    new Router(routes, { links: true }).mountOn(app)
src/pages/…            pages that load their own data
```

```ts
// server/main.ts
import { join } from 'node:path';
import jadis from '@jadis/fastify';
import Fastify from 'fastify';

const app = Fastify({ logger: true });
app.get('/api/recipes/:slug', async (request, reply) => findRecipe(request.params) ?? reply.code(404).send());

await app.register(jadis, {
  dev: process.argv.includes('--dev') ? { vite: await import('vite') } : undefined,
  entry: 'src/entry-server.ts',
  root: join(import.meta.dirname, '..'),
  requestData: (request) => ({ cookie: request.headers.cookie ?? '' }),   // data only: it crosses to a worker
});
await app.listen({ port: 3000 });
```

Other options: `outDir: { client, server }`, `workers` (renders at once, one per core but one by default), `preHandler` (a hook before page renders, such as a redirect to the login page).

```ts
// src/entry-server.ts
import { renderRoute } from '@jadis/core/server';
import type { RenderPage } from '@jadis/fastify';

export const render: RenderPage<{ cookie: string }> = async (url, request, server) => {
  const api = createApi((path) => server.fetch(`${server.origin}${path}`, { headers: { cookie: request.cookie } }));
  const rendered = await renderRoute(routes, url, {
    prepare: async (page, route) => (loadsData(page) ? page.load(route, api) : undefined),
    styles: server.styles,          // optional: stylesheets as cached files instead of inline <style>
  });
  if (!rendered) {
    return { body: '', status: 404 };
  }
  const page = loadsData(rendered.page) ? rendered.page : undefined;
  return {
    body: rendered.body,
    head: `<title>${escapeHtml(page?.pageTitle() ?? 'Recipes')}</title>`,
    status: page?.httpStatus() ?? (rendered.route.name === 'notFound' ? 404 : 200),
    headers: { 'cache-control': 'public, max-age=60' },
  };
};
```

`server.fetch` is Node's fetch, `server.origin` the server's own address, `server.styles` the plugin's stylesheet files. Node runs `server/main.ts` directly by stripping types: the server's TypeScript uses erasable syntax only and imports with `.ts` extensions.

## A page that loads its data

```tsx
export class RecipePage extends Jadis implements RoutedPage {
  static readonly selector = 'recipe-page';

  // Bound to an attribute: the server writes it into the HTML, the browser's upgrade reads it back.
  readonly data = this.useChange<RecipeView | null>(null, (data) => this.draw(data), {
    attribute: 'data',
    parse: (value) => (value === null ? null : parseRecipeView(JSON.parse(value))),
  });

  async load(route: ActiveRoute, api: Api): Promise<void> {
    const recipe = await api.recipe(route.params.slug);
    this.data.set(recipe ? { found: true, recipe } : { found: false });
  }

  onRoute(route: ActiveRoute): void {
    if (this.data.get() === null) {
      void this.load(route, browserApi);     // after a navigation in the browser: no server data
    }
  }

  httpStatus(): number {
    return this.data.get()?.found === false ? 404 : 200;
  }

  pageTitle(): string {                        // not `title`: HTMLElement has one
    const data = this.data.get();
    return data?.found ? data.recipe.title : 'No such recipe';
  }
}
```

- On the server, `prepare` calls `load` with an API that runs there; the page is created, not connected yet, so the value waits and draws in the render.
- In the browser, the page upgrades with `data` from its attribute; `onRoute` finds it there and loads nothing. After a navigation the router makes a new page without data, and `onRoute` loads it.
- The page owns the data and passes children what they show as properties: one attribute carries it.
- A missing record is a state the page draws (`{ found: false }`), apart from `null` for "not loaded".

## State travels in attributes

The values set in code on `useChange(…, { attribute })` fields are written as those attributes, when the field's `parse` reads them back the same:

| Value | Written as |
|---|---|
| Text | itself |
| A number | its digits (`NaN` and infinities are not written) |
| `true` / `false` | present and empty / absent |
| A list, an object | JSON |
| `null` | absent |

Fields bound to no attribute do not travel. A component that never connected writes nothing.

## What code must give back

Functions, listeners added from outside and objects with methods have no attribute. Set them again in the browser **in the same task as the definition**, or the browser paints the component without them first: load the code that sets them and the definitions it needs as one module graph (`const { setUp } = await import('./orders-page'); setUp(document.querySelector('orders-page'));`). A component that sets them in its own template needs nothing.

Registries components read as they render (icons, texts) must be filled before the components' modules are imported: their elements upgrade the moment their class registers.

## Rules on the server

- **Never `fetch` from a component**: the global `fetch` is refused during a render. Data comes through the page's `load` and the API given to `prepare`.
- **Nothing per visitor in a module**: renders interleave at every `await` in a worker. Pass the visitor's data as arguments.
- **No secret in an attribute-bound field**: its value is written into the page's HTML.
- **A visitor's page is private**: send it with `cache-control: private, no-store`. Public pages can be cached.
- **History mode only**: a hash never reaches the server.
- **No names an element already has** on pages: `pageTitle()`, `httpStatus()`, not `title`.

## Limits and troubleshooting

- happy-dom has no layout: anything measured (sizes, positions) is zero in the first paint. Draw a sensible first state with CSS.
- Timers do not run before the HTML is written: a render waits for `onConnect` and the data, not for timeouts.
- Text typed into a shadow-root field before the code loads is lost; buttons do nothing until then. Links and plain `<form method="get">` work without JavaScript: prefer them for what must work at once.

| What you see | What to do |
|---|---|
| A component shows empty for a moment after the code loads | Bind the field to an attribute, or set it in the same task as the definition |
| The page flashes, then shows again | The router made the page again: put the server's body inside the mount point, use history mode and the same route table |
| `a component fetched during a server render` | Load the data in `load`, with the fetch the server gives |
| Icons or texts missing after the code loads | Register them before importing the components |
| A value in the markup comes back wrong | Fix the field's `parse`, or keep the value out of the attribute |
| Another visitor's data in a page | Per-visitor state in a module, or a shared cache |

## Without Fastify

`renderRoute`, `renderToHtml(nodeOrHtml, { ready, styles })` and `serializeHtml(node, { styles })` work in any Node server and at build time. Register happy-dom's globals (`GlobalRegistrator.register(…)`) **before** importing the app's server code, keep Node's own `fetch` aside first, put the body in the shell with replacer functions (`shell.replace('<!--app-body-->', () => body)`), and after each render let go of happy-dom's query caches with `document.appendChild(document.createComment('')).remove()`. Details: `server-rendering/without-fastify.md` in the docs.
