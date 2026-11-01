# Data and Responses

On the server, the **page loads its data before the render**; its components only draw what they are given. In the browser, after a navigation, the same page loads the same data itself.

## A page that loads its data

The cooking example's pages follow one convention: a `load(route, api)` method that fills a field bound to an attribute.

```tsx
export class RecipePage extends Jadis implements RoutedPage {
  static readonly selector = 'recipe-page';

  /** The recipe shown, null until loaded. Bound to an attribute: the server writes it, the page upgrades with it. */
  readonly data = this.useChange<RecipeView | null>(null, (data) => this.draw(data), {
    attribute: 'data',
    parse: (value) => (value === null ? null : JSON.parse(value)),
  });

  async load(route: ActiveRoute, api: Api): Promise<void> {
    const slug = route.params.slug ?? '';
    const recipe = await api.recipe(slug);
    this.data.set(recipe ? { found: true, recipe } : { found: false, slug });
  }

  onRoute(route: ActiveRoute): void {
    // The server's data, or the recipe already shown: nothing to load.
    if (this.shownSlug() === route.params.slug) {
      return;
    }
    void this.load(route, browserApi);
  }
}
```

- **On the server**, the server entry calls `load` in `renderRoute`'s `prepare`, with an API that runs on the server. The page is created, not connected yet: the value waits, and draws when the page connects in the render.
- **In the markup**, the value of `data` is written as the `data` attribute, as JSON (see [Taking Over](./takeover.md#state-in-attributes)).
- **In the browser**, the page upgrades with `data` from its attribute and draws. The router then calls `onRoute`, which finds the data already there.
- **After a navigation**, the router makes a new page, without data: `onRoute` loads it.

The data is the page's: a component deeper down gets what it shows from the page (as a property, set in `draw`), so the page's attribute is the one place it travels.

A missing record is a state the page draws, not an error: `{ found: false }` lets the server answer 404 and the page say so. A `null` that means "not loaded yet" stays apart from it.

## The API, on the server and in the browser

The pages call the same API in both places, through a small interface:

```ts
export function createApi(request: (path: string) => Promise<Response>): Api {
  return {
    recipe: async (slug) => {
      const response = await request(`/api/recipes/${encodeURIComponent(slug)}`);
      return response.status === 404 ? undefined : response.json();
    },
    recipes: async (query) => (await request(`/api/recipes?q=${encodeURIComponent(query)}`)).json(),
  };
}

/** In the browser. */
export const browserApi = createApi((path) => fetch(path));

/** In a server render: Node's fetch, to the server itself. */
export const serverApi = (server: ServerTools) => createApi((path) => server.fetch(`${server.origin}${path}`));
```

`server` is what the plugin gives `render`: `server.fetch` is Node's own fetch, and `server.origin` the server's address. The global `fetch` is refused during a render: a component that fetched on its own would fetch without the visitor's credentials, from a relative address the server cannot resolve. The error says so, rather than rendering an empty page.

A server entry may also call the data layer directly (a database client) instead of going through HTTP: `load` only needs an `api` that answers.

## Query strings

The route given to `load` holds the query (`route.query`, a `URLSearchParams`), on the server as in the browser:

```tsx
async load(route: ActiveRoute, api: Api): Promise<void> {
  const query = route.query.get('q') ?? '';
  this.data.set({ query, recipes: await api.recipes(query) });
}
```

A search form then works without JavaScript: `<form method="get" action="/">` sends `/?q=…` to the server, which renders the results. With JavaScript, the page can catch the submit and navigate with the router: the same page, kept (`onRoute`), loads the new results.

## Sessions

The server sees what the browser sends with the page's request: its **cookies**, not a token kept in `localStorage`. A page with a visitor's data needs a session in a cookie (httpOnly), which the render forwards to the API.

```ts
// server/main.ts
await app.register(jadis, {
  entry: 'src/entry-server.ts',
  root: ROOT,
  // What a render gets of the request: data only, it crosses to a worker thread.
  requestData: (request) => ({ cookie: request.headers.cookie ?? '' }),
  // Runs before a page renders: a visitor without a session goes to the login page.
  preHandler: async (request, reply) => {
    if (!request.url.startsWith('/login') && !sessionOf(request)) {
      await reply.redirect('/login');
    }
  },
});
```

```ts
// src/entry-server.ts
export const render: RenderPage<{ cookie: string }> = async (url, request, server) => {
  const api = createApi((path) => server.fetch(`${server.origin}${path}`, { headers: { cookie: request.cookie } }));
  // …
};
```

Three rules keep visitors apart:

- **Nothing per visitor in a module.** A worker renders many visitors' pages, and renders interleave at every `await`: a module's "current user" would mix them. Pass what a render needs as arguments, as `api` above.
- **No secret in an attribute.** The server writes every attribute-bound value set in code into the HTML. A token there ends up in the page's source: pass it as a plain property, or keep it on the server.
- **No shared cache.** A page with a visitor's data is sent with `cache-control: private, no-store`, so that no cache serves it to someone else.

The data a page writes is the visitor's own, the same they see. Trim what the API gives to what the page shows.

## The response: status, title, headers

`render` answers a `PageResponse`: the `body`, and optionally the `head` (in place of `<!--app-head-->`), the `status` and `headers`.

`renderRoute` gives back the page element as rendered, so the server entry can ask it:

```ts
const rendered = await renderRoute(routes, url, { prepare });
const page = loads(rendered.page) ? rendered.page : undefined;
return {
  body: rendered.body,
  head: `<title>${escapeText(page?.pageTitle?.() ?? 'Recipes')} · Cooking</title>`,
  status: page?.httpStatus?.() ?? 200,
};
```

```tsx
// in the page
httpStatus(): number {
  return this.data.get()?.found === false ? 404 : 200;
}

pageTitle(): string {
  const data = this.data.get();
  return data?.found ? data.recipe.title : 'No such recipe';
}
```

:::warning Names an element already has
A page is an `HTMLElement`: a method named `title` or a field named `hidden` replaces the element's own, and TypeScript then refuses the class as a page. Hence `pageTitle()` and `httpStatus()`.
:::

| Case | Status |
|---|---|
| A page with its data | 200 |
| A record that does not exist (`{ found: false }`) | 404, from the page |
| A path no route matches (the catch-all route) | 404, from the route's name |
| No session | a redirect, from Fastify's `preHandler`, before any render |
| The API fails, `load` throws | 500, from Fastify's error handler |

Public pages, the same for everyone, can be cached: `cache-control: public, max-age=60` lets a CDN serve them.
