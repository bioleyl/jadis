# Routed Pages

By default, every navigation creates the page component again. A page can instead declare two optional methods, and the router then works with it:

| Method | Called | Effect |
|---|---|---|
| `onRoute(route)` | Once the page is connected (after its `onConnect`), then at each URL change whose route is on the same page | The router **keeps the page** instead of creating it again |
| `canLeave(next)` | Before each URL change | Returning `false` (or a promise of `false`) **keeps the person on the page**, and puts the URL back |

Both are typed by the `RoutedPage` interface.

## Keeping a Page: `onRoute`

```tsx
import { Jadis } from '@jadis/core';

import type { ActiveRoute, RoutedPage } from '@jadis/core';

export class UsersPage extends Jadis implements RoutedPage {
  static readonly selector = 'users-page';

  onRoute(route: ActiveRoute): void {
    // route.params.id is undefined on /users, set on /users/:id
    this.showUser(route.params.id);
  }
}
```

```typescript
const routes = defineRoutes({
  user:  { path: '/users/:id', page: UsersPage },
  users: { path: '/users', page: UsersPage },
});
```

Going from `/users` to `/users/42`, then to `/users/7`, keeps the same `<users-page>`: its list, its scroll position and anything it holds stay. The router compares **components**, not route names: two routes on the same page (and the same root component) keep it.

When the page is kept, the router also updates the parameters' attributes: it sets the new ones and removes those the new route does not have. A page can therefore follow its parameters with `useChange(…, { attribute })` instead of `onRoute`, but it must still declare `onRoute` to be kept.

`onRoute` is called after `onConnect`, so the page's listeners are wired when the first route arrives. If the route changes again before the page is connected, the page receives only the last one.

A page without `onRoute` behaves as before: it is created again at each navigation.

## Holding the Person Back: `canLeave`

```tsx
export class EditorPage extends Jadis implements RoutedPage {
  static readonly selector = 'editor-page';

  canLeave(): boolean | Promise<boolean> {
    return !this.isDirty() || askToLeave(); // a dialog of the app, resolving to true for "Leave"
  }
}
```

`canLeave` receives the route the person would go to, so it can let some changes through. It is asked:

- before `router.goto()` changes the URL: when it refuses, nothing changes;
- after the URL changed through a link, the address bar or the back button (`hashchange` or `popstate`): when it refuses, the router puts the previous URL back with `history.replaceState`.

It is not asked when the URL did not change.

### Asking first: a promise

A page that asks the person in a dialog of its own answers with a `Promise<boolean>` (the type `LeaveAnswer`). While it is pending, the page stays and so does its URL: after a link, the address bar or the back button, the router puts the URL back at once. When the promise resolves to `true`, the router goes on to the route that was asked, putting its URL back first; `false`, or a promise that rejects, keeps the page.

A navigation that comes while the page asks wins over it: the answer of an earlier question is then ignored, so a late "Leave" never takes the person to a page they no longer wanted. Asking twice is the page's to avoid, by giving the same pending question to both (jlib's `guardLeave()` does).

For a reload or a closed tab, use the browser's `beforeunload` event: the browser asks, not the page.

## The Active Route

`onRoute`, `canLeave` and `router.currentRoute` give an `ActiveRoute`:

```typescript
interface ActiveRoute {
  name: string;                    // the route's key
  path: string;                    // the route's path pattern, such as '/users/:id'
  componentSelector: string;
  params: Record<string, string>;  // the parameters read from the URL
  query: URLSearchParams;          // the URL's query; in hash mode, the part of the hash after '?'
}
```

The query is not part of matching: `/#/users?sort=name` matches `/users`.

## See Also

- [Overview](./overview.md) — Getting started with routing.
- [Router API Reference](../api/router-class.md) — Complete API documentation.
