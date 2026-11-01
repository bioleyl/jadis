# Taking Over in the Browser

The server's HTML paints first. Then the components' code loads, and each component takes over its element. This page explains what the upgrade keeps, and what the app's code must give back.

## The upgrade

1. The browser parses the page: each `<template shadowrootmode="open">` becomes the shadow root of its element, styles included. The page is painted.
2. A module defines a component (`MyCard.register()`, at the bottom of its module). Every element of that name upgrades at once.
3. The constructor attaches the shadow root: the browser hands it the declarative one, **emptied**.
4. The connection renders the template, then applies the attributes and the waiting `useChange` values, then the translations: as for any component, before the browser paints again.
5. `onConnect` runs a task later and wires the listeners.

Steps 3 and 4 happen in the same task: the browser never paints the emptied shadow root. What the component then shows comes from its **attributes** and its code, not from the server's nodes, which are gone.

## State in attributes

The server writes on each component the values its attribute-bound fields were given in code, as those attributes:

```tsx
readonly rows = this.useChange<Row[]>([], (rows) => this.drawRows(rows), {
  attribute: 'rows',
  parse: (value) => (value === null ? [] : JSON.parse(value)),
});
```

```tsx
table.rows.set(rows); // on the server, before or during the render
```

```html
<data-table rows='[{"id":1,"name":"Ada"}]'>…</data-table>
```

| Value | Written as |
|---|---|
| Text | itself |
| A number | its digits; `NaN` and infinities are not written |
| `true` / `false` | the attribute present, empty / absent |
| A list, an object | JSON |
| `null` | the attribute absent |

A value is written only when the field's own `parse` reads it back as the same value, so a value no attribute can hold (a `Date` with a parser that wants a number, a function) stays out rather than coming back wrong. A value its attribute already gives is not written again. A component that has not connected yet writes nothing: its fields have not read their attributes.

Fields bound to no attribute do not travel: a value the browser needs on the upgrade belongs in an attribute-bound field.

## What code must give back

Some state no attribute can hold: a listener added from outside, a function (a table's cell renderers), an object with methods. The page's code sets it again in the browser, and **in the same task as the definition**. A task later, the browser has painted the component without it: a table with its default cells, then its renderers.

The way to keep them in one task: the code that sets them and the definitions it needs load as **one module graph**. ES modules evaluate a whole static graph in one go, and the code after an `await import()` runs before the browser paints:

```ts
// The page's module imports its components statically: they are defined as it evaluates,
// and the code below runs right after, in the same task.
const { setUpOrders } = await import('./orders-page');
setUpOrders(document.querySelector('orders-page'));
```

A component that sets such state in its own template (a page writing `<DataTable renderers={RENDERERS} />`) needs nothing: its template runs in the upgrade.

## Registries before definitions

A component that reads a registry as it renders (icons by name, translations) upgrades as soon as its module defines it, which happens when the app's code imports it, often before the app registers anything:

```ts
import { IconButton } from './icon-button'; // defines it: the server's <icon-button>s upgrade here
registerIcons({ plus: Plus });              // too late for them
```

Register first (a module imported before the components), or let the component look again at the end of the task, as jlib's `jl-icon` does: an icon not registered yet is drawn after a `queueMicrotask`, which still runs before the paint.

## The router

`Router.mountOn()` first shows the route of the URL. When its mount point already holds that route's elements (the group's root component, then the page, as `renderRoute` writes them), the router keeps them as the page shown instead of making it again:

- the elements upgrade in place, with the state the server wrote on them;
- the page gets the route through `onRoute`, once connected, as usual;
- from then on, the router makes every page itself.

If the mount point holds something else (another page, nothing), the router makes the page as before. The page's `onRoute` decides whether to load: the server's data is already there.

## Components without shadow root

A component with `useShadowDom = false` renders its template in its own children, next to those the page gave it. The server writes a `<!--jadis-template-->` mark before the template; on the upgrade, the component removes the mark and what follows it, then renders its template there. The children the page gave it come before the mark and stay.

## Form fields

A field's value set in code (`input.value = 'pasta'`) is not an attribute: the server writes it as one, so the first paint shows it. The same goes for a checked box (`checked`), a chosen option (`selected`) and a text area's text. A password's value is never written.

## What a visitor loses before the code

- **Typing.** Text typed in a field inside a shadow root before the code loads is lost: the component renders its field again.
- **ARIA from `ElementInternals`.** A role or a label set through `attachInternals()` has no place in the markup: it comes with the upgrade.
- **Listeners.** Buttons do nothing until the code loads. Links and plain forms work: prefer them for what must work at once.
