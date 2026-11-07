# Routing

The `Router` maps URLs to page components, creates the page of the URL in a mount point, and follows navigation.

## Contents

- Routes
- The router
- Navigating
- Links
- Parameters and query
- Pages: made again, or kept with `onRoute`
- Holding the person back: `canLeave`
- Layouts: route groups and root components
- Following route changes
- Showing pages your way
- Traps

## Routes

```ts
// src/routes.ts
import { defineRouteGroup, defineRoutes } from '@jadis/core';

import { HomePage } from './pages/home-page';
import { NotFoundPage } from './pages/not-found-page';
import { OrderPage } from './pages/order-page';
import { OrdersPage } from './pages/orders-page';

export const routes = defineRoutes({
  home: { page: HomePage, path: '/' },
  order: { page: OrderPage, path: '/orders/:orderId' },   // specific first
  orders: { page: OrdersPage, path: '/orders' },
  notFound: { page: NotFoundPage, path: '/:rest' },       // the catch-all, last
});
```

- A route is `{ page, path, options? }`. `page` is a registered Jadis class; importing its module registers it.
- **The first route that matches wins**, in the order written. A `:param` matches one or more characters, `/` included: `/orders/:orderId` also matches `/orders/42/lines`.
- **A URL no route matches throws.** Always end with a catch-all such as `/:rest`.
- Paths are normalised: double slashes collapse, a trailing slash is dropped.

## The router

```ts
// src/main.ts
import { Router } from '@jadis/core';

import { routes } from './routes';

export const router = new Router(routes, { links: true });   // history mode by default
router.mountOn(document.getElementById('app') ?? document.body);
```

| Option | Default | Meaning |
|---|---|---|
| `mode` | `'history'` | `'history'` for `/orders` (the server must answer every app path with the page), `'hash'` for `/#/orders` (works from any static host) |
| `baseUrl` | `'/'` | The folder the app is served from: `'my-app'` for `/my-app/orders` |
| `links` | `false` | History mode: follow clicks on links to the routes instead of loading the page |
| `signal` | none | Stops the router following the URL and the links once aborted |

- `mountOn(element)` takes an `HTMLElement` (use `getElementById`, which returns one; `querySelector` returns `Element`), shows the route of the current URL there, and follows the URL from then on.
- Make one router for the app, in a module others import when they navigate.

## Navigating

```ts
router.goto('order', { orderId: '42' });       // by name; parameters checked at compile time
router.goto('orders');                          // a route without parameters takes no second argument
router.replace('home');                         // in place of the current history entry
router.gotoPath('/orders/42?tab=lines');        // by path, query included: an address known at run time
router.replacePath('/login');
router.match('/orders/42');                     // the route of a path, or undefined: never navigates
router.currentRoute;                            // the route shown: name, path, params, query
```

`goto` and `gotoPath` throw for an unknown name or a path no route matches. Use `replace` for a page that only redirects, so Back skips it.

## Links

With `links: true` (history mode), the router follows clicks on `<a href>` to its routes, in shadow roots too. It leaves to the browser: clicks with a modifier key or another button, links with a `target`, a `download` attribute or `rel="external"`, links to another origin, and paths no route matches.

```tsx
<a href="/orders/42">Order 42</a>
<a href="/api/report.pdf" rel="external">Download</a>   {/* with a catch-all route, every path matches: mark files and server URLs */}
```

Without `links: true`, a plain link reloads the page. In hash mode, write `href="#/orders/42"`.

## Parameters and query

- Parameters become **attributes** of the page (and of its root component), in kebab case: `:orderId` sets `order-id="42"`. Read them with a `useChange` field bound to the attribute, or in `onRoute` as `route.params.orderId`.
- Values are taken from the URL as written: not URL-decoded, and `goto` does not encode them. Keep parameters URL-safe (ids, slugs), or `encodeURIComponent` them when navigating and `decodeURIComponent` them when reading.
- The query is not matched. It is `route.query` (and `router.currentRoute.query`), a `URLSearchParams`, in hash mode too.

```tsx
export class OrderPage extends Jadis {
  static readonly selector = 'order-page';

  readonly orderId = this.useChange('', (orderId) => this.load(orderId), { attribute: 'order-id' });
  // …
}
```

## Pages: made again, or kept with `onRoute`

By default **every navigation creates the page again** (and its root component): its state is lost. A page that declares `onRoute(route)` is **kept** while the routes stay on it, even under another route name, as long as the page and root component are the same. The router then updates its parameter attributes and calls `onRoute` again.

```tsx
import type { ActiveRoute, RoutedPage } from '@jadis/core';

export class OrdersPage extends Jadis implements RoutedPage {
  static readonly selector = 'orders-page';

  onRoute(route: ActiveRoute): void {
    // Called once connected (after onConnect), then at each URL change that stays on this page.
    this.filter(route.query.get('status') ?? 'all');
    this.select(route.params.orderId);   // undefined on /orders, set on /orders/:orderId
  }
}
```

With both `/orders` and `/orders/:orderId` on `OrdersPage`, going from one to the other keeps the list, its scroll position and what it holds. If the route changes several times before the page has connected, it gets only the last one.

Keep what must outlive a page in a service or a bus, not in the page.

## Holding the person back: `canLeave`

```tsx
export class EditorPage extends Jadis implements RoutedPage {
  static readonly selector = 'editor-page';

  canLeave(next: ActiveRoute): boolean | Promise<boolean> {
    return !this.hasUnsavedChanges() || confirmLeave(next);   // an app dialog resolving to true for "Leave"
  }
}
```

- Asked before every URL change: `goto`, a link, the address bar, Back and Forward.
- `false` cancels a `goto`, or puts the URL back after a link or Back (the router moves back to the page's history entry, so the history stays as it was).
- A `Promise<boolean>` keeps the page while it waits; `true` then shows the route asked, `false` puts the URL back. A rejected promise keeps the page. A newer navigation meanwhile wins.
- Answer `true` at once when nothing would be lost, so navigation stays instant.
- The router numbers history entries in `history.state`. To change the URL yourself, keep that state: `history.replaceState(history.state, '', url)`.

## Layouts: route groups and root components

A root component is a layout around a set of pages: the router creates it, then the page inside it, and the layout shows the page through a `<slot>`.

```ts
export const routes = defineRoutes({
  ...defineRouteGroup('/', {
    home: { page: HomePage, path: '/' },
    orders: { page: OrdersPage, path: '/orders' },
  }, { rootComponentSelector: AppLayout.selector }),
  account: defineRouteGroup('/account', {
    profile: { page: ProfilePage, path: '/profile' },
  }, { rootComponentSelector: AccountLayout.selector }),
  notFound: { page: NotFoundPage, path: '/:rest' },
});
// names: home, orders, accountProfile, notFound
```

```tsx
export class AppLayout extends Jadis {
  static readonly selector = 'app-layout';

  templateHtml(): Node {
    return (
      <>
        <header><a href="/">Home</a> <a href="/orders">Orders</a></header>
        <main><slot /></main>
      </>
    );
  }
}
```

- `defineRouteGroup(prefix, routes, options)` prefixes the paths. Spread into `defineRoutes`, the names stay as written; placed under a key, they are prefixed with it in camel case (`account` + `profile` gives `accountProfile`). Groups nest.
- The root component is made again with each new page, like the page. A frame that must keep its state across every page belongs outside the router's mount point.
- Import and register the root component's class before navigating.

## Following route changes

`router.bus` emits `change` with the route once its page is shown, the first one included:

```ts
// In a component
onConnect(): void {
  this.onBus(router.bus, 'change', (route) => this.markCurrent(route.name));
}

// Outside components
router.bus.register('change', (route) => { document.title = TITLES[route.name] ?? APP_NAME; }, signal);
```

## Showing pages your way

The router replaces the mount point's children with each new page. To keep the current page until the next one has its data, give `mountOn` a `show` function, which must put `next` in the document at once and remove `current` when it wants:

```ts
router.mountOn(outlet, {
  show: (next, current) => {
    next.hidden = true;
    outlet.append(next);
    whenReady(next).then(() => {
      current?.remove();
      next.hidden = false;
    });
  },
});
```

## Traps

- A missing catch-all route throws on the first unknown URL.
- A general route listed before a specific one takes its URLs.
- History mode needs the server to answer every app path with `index.html` (Vite's dev server does); otherwise use hash mode.
- Page state is lost at each navigation unless the page declares `onRoute`.
- `route.params` hold the raw URL text.
- Pages and root components must be registered before the router shows them: import them in the routes module.
- Pages import the router to navigate, and the router's module imports the routes, which import the pages. That cycle is harmless while the router is only used inside methods. A layout that imports the router must not be read while modules load: give the routes its selector as a constant from a module without imports, not `AppLayout.selector` ([recipes.md](recipes.md#an-app-shell-layout-router-language)).
