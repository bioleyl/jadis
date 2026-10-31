# Overview

Jadis includes a built-in, lightweight router for component-based navigation. It is designed to be simple yet powerful enough for single-page applications with dynamic routes, route groups, and shared layouts.

## Key Concepts

| Concept | Description |
|---|---|
| **Route** | A mapping between a URL path and a Jadis component (the "page"). |
| **Route Group** | A collection of routes sharing a common prefix and optional shared layout. |
| **Navigation** | Changing the current route: `router.goto()` by name, `router.gotoPath()` by path, `replace()` and `replacePath()` in place of the history entry, links with `links: true`. |
| **Mount Point** | The DOM element where route components are rendered. |

## Quick Start

```typescript
import { Router, defineRoutes } from '@jadis/core';

const routes = defineRoutes({
  home:   { path: '/', page: HomePage },
  about:  { path: '/about', page: AboutPage },
});

const router = new Router(routes);
router.mountOn(document.getElementById('app') ?? document.body);
```

## Navigation Modes

The router supports two modes:

| Mode | URL Format | Use Case |
|---|---|---|
| **`history`** (default) | `/about` | Clean URLs; requires server-side fallback |
| **`hash`** | `/#/about` | Simple deployments, no server config needed |

```typescript
const router = new Router(routes, { mode: 'history' });
```

## Base URL

If your app is hosted in a subdirectory, specify the `baseUrl`:

```typescript
const router = new Router(routes, { baseUrl: 'my-app' });
// Routes resolve relative to /my-app/
```

## Route Parameters

Dynamic segments (`:param`) are passed as attributes to the page component:

```typescript
const routes = defineRoutes({
  user: { path: '/user/:id', page: UserPage },
});
```

Navigating to `/user/42` renders `<user-page id="42"></user-page>`.

## Query

The query is not part of matching: `/user/42?tab=posts` (or `/#/user/42?tab=posts` in hash mode) matches `/user/:id`. Read it from `router.currentRoute.query`, a `URLSearchParams`, or from the route a [routed page](./routed-pages.md) receives.

## Root Components

Routes can specify a `rootComponentSelector` for shared layouts:

```typescript
const routes = defineRoutes({
  home: {
    path: '/',
    page: HomePage,
    options: { rootComponentSelector: 'app-layout' },
  },
});
```

This wraps the page component inside the specified layout component, which shows it through a `<slot>`.

## Good to Know

- **The first matching route wins**, and a `:param` matches across `/`: `/user/:id` also matches `/user/42/edit`. List specific routes before general ones.
- **A URL that no route matches throws.** End your routes with a catch-all, such as `notFound: { path: '/:rest', page: NotFoundPage }`.
- **Links are followed when asked.** In history mode, `<a href="/about">` reloads the whole page unless the router is made with `links: true`: it then follows the links to its routes, in shadow roots too, and leaves to the browser a click with a modifier key, a link with a `target`, a `download` or `rel="external"`, to another origin, or to a path no route matches. With a catch-all route every path matches: mark the links to files and to the server with `rel="external"`. In hash mode, write `href="#/about"`.
- **Every navigation creates the page component again**, and its root component too: state kept in them is lost. A page that declares `onRoute` is kept while the routes stay on it, and one that declares `canLeave` can hold the person back: see [Routed Pages](./routed-pages.md). Keep what must outlive a page in a service or a [Bus](../api/bus-class.md).
- Register the page and root components before navigating to them.

## Following Route Changes

`router.bus` emits `change` with the route, once its page is shown, the first one included: a frame marks its current place, or writes the tab's title.

```typescript
router.bus.register('change', (route) => {
  document.title = titles[route.name];
}, signal);
```

## Showing Pages Your Way

The router replaces the mount point's children with each new page. To keep the page shown until the next one has its data, give `mountOn` a `show` function: it puts the next page in the document at once, and removes the current one when it wants.

```typescript
router.mountOn(outlet, {
  show: (next, current) => {
    next.hidden = true;
    outlet.append(next);
    whenLoaded(next).then(() => {
      current?.remove();
      next.hidden = false;
    });
  },
});
```

The new page is the router's from then on: it is asked `canLeave`, and gets `onRoute`.

## See Also

- [Declaring Routes](./routes.md) — Route definitions and navigation.
- [Route Groups](./route-groups.md) — Organizing routes with shared prefixes.
- [Routed Pages](./routed-pages.md) — Keeping a page between routes, and holding the person back.
- [Router API Reference](../api/router-class.md) — Complete API documentation.
