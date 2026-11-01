# TODO

What apps built on Jadis had to work around, written down where it was met so it can be fixed in Jadis. Each item
says what is missing, why it matters (what the app had to do instead), where it was found, and a proposal. Remove an
item once it is released, and tell the app it can drop its workaround.

## Router

### Follow links in history mode

- **What:** in history mode, a click on `<a href="/orders/42">` reloads the whole page (the docs say so:
  routing/overview.md, "Links are not intercepted").
- **Why:** every app in history mode has to write the same document click handler: find the anchor in the event's
  composed path (links live in shadow roots), skip modified clicks, `target`, `download`, other origins and the
  API's addresses, then navigate. Real `href`s are what make "open in a new tab", middle click and screen readers
  work, so apps keep them and need this handler.
- **Found in:** StockWize, `frontend/src/services/navigation.ts` (`followLink`, `pageLinkOf`), 2026-10-31.
- **Proposal:** an option, `new Router(routes, { mode: 'history', links: true })`, that follows same-origin links to
  the router's routes and leaves every other click to the browser.

### Go to an address, not only to a route name

- **What:** `goto(name, params)` is the only way to navigate; there is no public way to find the route of an
  address (`match(path)`) or to go to one.
- **Why:** a clicked link, a place of a navigation menu or a command palette entry carries an address. To use
  `goto`, StockWize matches the address against its routes itself, copying the router's matching (`:param` as
  `(.+)`, first match wins), then casts `goto` to call it with a name and parameters only known at run time.
- **Found in:** StockWize, `services/navigation.ts` (`routeAt`, `goToAddress`), 2026-10-31.
- **Proposal:** `router.match(path): ActiveRoute | undefined` and `router.gotoUrl(path)` (or `goto` accepting an
  address), sharing the router's own matching.

### Replace instead of push

- **What:** `goto` always adds a history entry.
- **Why:** a page that redirects ("/" sending on to the first place of the navigation) traps the back button: back
  returns to "/", which goes forward again. StockWize had to drop its redirect page and make "/" a route of its own
  showing the first place's page.
- **Found in:** StockWize, `frontend/src/routes.ts` (`homeSpecOf`, the `home` route), 2026-10-31.
- **Proposal:** `goto(name, params, { replace: true })`, keeping the router's history numbering of the entry.

### Say when the route changed

- **What:** the router emits nothing when it shows a route.
- **Why:** the frame marks the current place in the navigation and writes the browser tab's title. Apps listen to
  `popstate`/`hashchange` after the router's own listener, but `goto` fires no event, and a page that asks before
  it is left changes later. StockWize adds a `MutationObserver` on the mount point and guards against
  `currentRoute` not having changed.
- **Found in:** StockWize, `frontend/src/app.tsx` (`mountRouter`, `follow`), swai `sw-app-shell.tsx`, 2026-10-31.
- **Proposal:** `router.bus` with `change` (the `ActiveRoute`, once shown), and maybe `navigating` (asked, while
  `canLeave` answers or the page loads).

### Let the app decide when the new page shows

- **What:** the router shows a page with `mountPoint.replaceChildren(page)` at once.
- **Why:** the page then appears before its data: an empty body, then content popping in and pushing the rest down.
  StockWize keeps the current page until the next has its data by overriding `replaceChildren` on the mount point,
  adding the next page hidden beside it, and swapping later (one child at a time: `replaceChildren` with the page
  itself would reconnect it, and it would load again).
- **Found in:** StockWize, `frontend/src/templates/page-outlet/page-outlet.tsx`, `docs/smooth-pages.md`, 2026-10-31.
- **Proposal:** a mount option, `mountOn(el, { show: (next, current) => void | Promise<void> })`, for the app to
  place the page (and a default that keeps today's behaviour).

## JSX

### Typed event props on class references

- **What:** a component written by its class takes its public fields as props, but no `on…` handlers:
  `<JlListItem onClick={…}>` does not type-check (only `onclick`, the DOM property, does), and there is no way to
  listen to a component's own `useEvents` events in JSX.
- **Why:** rows created in a list (`items.map(…)`) need a handler each. StockWize creates the row, then calls
  `row.events.register('press', …)` on it before returning it, which works only because rows are never moved.
- **Found in:** StockWize, `pages/admin-users`, `pages/platform`, `pages/admin-categories`, 2026-10-31.
- **Proposal:** type `on<Event>` props from the component's `useEvents` map (`onPress` for `{ press: undefined }`),
  registered with the component's kill signal, plus the standard DOM `on<Event>` handlers.

## Translations

### Flat dotted keys type-check but never resolve

- **What:** `defineTranslations({ 'account.title': 'My account' })` is accepted (`TranslationKey` gives
  `'account.title'`), but `t('account.title')` returns the key: `findMessage` splits it and looks for a group.
- **Why:** an app moving a flat catalogue (`'group.key': text`, the usual format) to Jadis gets no error and no
  texts. StockWize converted its catalogues to groups by script.
- **Found in:** StockWize, `frontend/src/i18n/*.ts`, 2026-10-31.
- **Proposal:** refuse keys containing a dot in the types (as an unknown key is), or look the whole key up first.

### `<html lang>` is not written for the starting language

- **What:** `setLocale(locale)` writes `document.documentElement.lang` only when the locale changes; when the
  starting locale is the source's, nothing writes it.
- **Why:** the page keeps whatever `index.html` says. StockWize writes it itself after its first `setLocale`.
- **Found in:** StockWize, `frontend/src/i18n/i18n.ts` (`startLocale`), 2026-10-31.
- **Proposal:** write `lang` in `setLocale` even when the locale is already active (or when the translator is
  created).

### Numbers in placeholders are always grouped

- **What:** a number given to a placeholder is written with `Intl.NumberFormat`: order #1234 becomes "#1'234".
- **Why:** documented in one line, easy to miss: StockWize's order numbers were grouped until it passed them as
  strings (`formatOrderNumber`).
- **Found in:** StockWize, `frontend/src/services/format.ts`, 2026-10-31.
- **Proposal:** a clear note in the translation docs with this example, and maybe a raw form for a placeholder.
