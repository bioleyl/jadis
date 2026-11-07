# Mistakes models make with Jadis

Read this the first time you use the skill in a session. Models that do not know Jadis write it like React, Vue or Lit: they re-render, invent hooks, and override the custom element callbacks. Each entry shows the mistake, why it breaks, and what to write instead. The rule names are those of [SKILL.md](../SKILL.md#rules).

## Contents

1. Re-rendering on a change
2. Inventing APIs from other frameworks
3. A template returned as a string
4. Overriding the custom element callbacks
5. Listeners that outlive the component
6. Assuming one connection
7. Reading refs too early
8. A JSX prop expected to set an attribute
9. Changing a `useChange` value in place
10. A callback that applies a difference
11. Redrawing a whole list for one row
12. `document.querySelector` into a component
13. Global CSS expected to style inside
14. A component that is not registered, or registered too late
15. Names an element already has
16. `innerHTML` with data
17. Async work after the component left
18. A bus listener without a signal
19. Router traps
20. Tests that do not wait for `onConnect`
21. A second framework "to help"

## 1. Re-rendering on a change

Rule: **Draw once, change in place.**

```tsx
// Bad: rebuilds the whole shadow root on every change
private readonly _count = this.useChange(0, (count) => {
  this.shadowRoot?.replaceChildren(this.templateHtml());
});

templateHtml(): Node {
  return <p>Count: {this._count.get()}</p>;
}
```

Every change throws away the DOM: focus, selection, scroll position, listeners added in `onConnect` and the state of child components are lost. `templateHtml()` runs once, at the first connection.

```tsx
// Good: the template holds the structure, the callback changes one node
private readonly _count = this.useChange(0, (count) => {
  this._refs.count.textContent = String(count);
}, { immediate: true });

private readonly _refs = this.useRefs((ref) => ({ count: ref('#count') }));

templateHtml(): Node {
  return <p>Count: <span id="count" /></p>;
}
```

## 2. Inventing APIs from other frameworks

Rule: **Real APIs only.**

None of these exist in Jadis: `useState`, `useEffect`, `this.setState`, `this.render()`, `this.update()`, `this.requestUpdate()`, `@property`, `@state`, `@customElement`, `static properties`, `static styles`, `` html`…` `` templates, `this.props`, `this.$emit`, `defineProps`, `connected()`, `mounted()`, `onMount`.

| Wanted | Jadis |
|---|---|
| State that shows | `this.useChange(initial, (value) => …)` |
| Run code once in the page | `onConnect()` (runs again after a reconnection) |
| Cleanup | Automatic for `this.on`, `onBus`, `events.register`; `onDisconnect()` for timers |
| Define the element | `static readonly selector = 'my-card'` and `MyCard.register()` |
| Styles | `templateCss(): string` |
| Template | `templateHtml(): Node` |

The whole public surface is in [api.md](api.md). Check an API there, or in `node_modules/@jadis/core/dist/dts/`, before calling it.

## 3. A template returned as a string

```ts
// Bad
templateHtml() {
  return `<p>Hello <span id="name"></span></p>`;
}
```

`templateHtml()` must return a `Node`: a JSX element, a fragment, or what `createElement()` or `document.createElement()` makes. A string is appended as text, or fails the type check.

```tsx
// Good: JSX
templateHtml(): Node {
  return <p>Hello <span id="name" /></p>;
}

// Good: without JSX
templateHtml(): Node {
  const paragraph = createElement('p', { props: { textContent: 'Hello ' } });
  createElement('span', { attrs: { id: 'name' } }, paragraph);
  return paragraph;
}
```

## 4. Overriding the custom element callbacks

Rule: **Never override the custom element callbacks.**

```ts
// Bad
static observedAttributes = ['label'];

connectedCallback() {
  this.button.addEventListener('click', this.onClick);
}

attributeChangedCallback(name: string, _old: string, value: string) {
  this.label.textContent = value;
}
```

Jadis's `connectedCallback` draws the template, applies attributes and pending changes, and schedules `onConnect`; overriding it breaks all of that. Its `disconnectedCallback` aborts the kill signal. `observedAttributes` is ignored: `useAttributes` observes attributes itself.

```ts
// Good
readonly label = this.useChange('', (label) => {
  this._refs.label.textContent = label;
}, { attribute: 'label' });

onConnect(): void {
  this.on(this._refs.button, 'click', () => this.press());
}
```

## 5. Listeners that outlive the component

Rule: **Listeners live with the connection.**

```ts
// Bad: never removed; after the component leaves, it still runs on every resize
constructor() {
  super();
  window.addEventListener('resize', () => this.fit());
}
```

```ts
// Good: removed at disconnection, added again at the next connection
onConnect(): void {
  this.on(window, 'resize', () => this.fit());
}
```

`this.on(target, event, callback)` takes an element, `window` or `document`. For any other event target (a `MediaQueryList`, a `WebSocket`, a `BroadcastChannel`), pass the kill signal yourself:

```ts
onConnect(): void {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', () => this.drawTheme(query.matches), { signal: this.killSignal });
}
```

Never call `removeEventListener` by hand: the signal does it.

## 6. Assuming one connection

Rule: **`onConnect` runs again.**

```ts
// Bad: a list moved out of the page and back gets its rows twice
async onConnect(): Promise<void> {
  const items = await api.items();
  for (const item of items) {
    this._refs.list.append(<li>{item.name}</li>);
  }
}
```

A removal followed by a reconnection runs `onConnect` again on the same DOM, which still holds the rows. (A move with `append` or `insertBefore` is not a reconnection.)

```ts
// Good: the state decides, and the callback draws it whole
private readonly _items = this.useChange<Item[] | undefined>(undefined, (items) => this.drawItems(items ?? []));

async onConnect(): Promise<void> {
  if (this._items.get()) {
    return;
  }
  const items = await api.items({ signal: this.killSignal });
  if (this.isConnected) {
    this._items.set(items);
  }
}
```

## 7. Reading refs too early

```ts
// Bad: the constructor runs before the template exists, so the getter throws
private readonly _refs = this.useRefs((ref) => ({ title: ref('h2') }));

constructor() {
  super();
  this._refs.title.textContent = 'Orders'; // throws: "h2 element is not reachable"
}
```

Refs are getters that query the shadow root on each access. Read them in `onConnect()`, in a `useChange` or attribute callback, or in a method called after the first connection. A static text belongs in the template: `<h2>Orders</h2>`.

## 8. A JSX prop expected to set an attribute

Rule: **JSX props set properties.**

```tsx
// Bad: `label` is assigned as a property; a useAttributes callback for "label" never runs
<my-badge label="New" />
```

A JSX prop with no hyphen sets the property of that name (and calls `.set()` when the property is a `useChange` field). Three ways to get it right:

```tsx
// Good: the child reads it as a property: a useChange field
readonly label = this.useChange('', (label) => { this._refs.text.textContent = label; });
// parent
<MyBadge label="New" />

// Good: the parent sets the attribute
<my-badge attrs={{ label: 'New' }} />

// Good: hyphenated names are always attributes
<my-badge data-label="New" />
```

A `useChange` field bound to an attribute (`{ attribute: 'label' }`) works both ways: the prop sets it, and so does the attribute in HTML.

## 9. Changing a `useChange` value in place

Rule: **Callbacks draw the whole value.**

```ts
// Bad: oldValue and newValue are the same array; anything comparing them sees no change
this._items.get().push(item);
this._items.set(this._items.get());
```

```ts
// Good
this._items.set((items) => [...items, item]);
```

`set()` always calls the callback once connected, even with an equal value, and `oldValue` is the previous value itself, not a copy.

## 10. A callback that applies a difference

```ts
// Bad: adds a row each time it runs, but it can run twice with the same value
private readonly _items = this.useChange<Item[]>([], (items) => {
  this._refs.list.append(this.renderRow(items.at(-1)));
});
```

At the connection, an attribute-bound or `immediate` field can call its callback more than once with the same value, and a `set()` with an equal value calls it again. Draw the value whole, or reconcile against what the DOM holds (next entry).

## 11. Redrawing a whole list for one row

```ts
// Bad: rebuilds every row when one is ticked; focus and child state are lost
this._refs.list.replaceChildren(...items.map((item) => this.renderRow(item)));
```

Rebuilding is fine for a short list drawn once. For a list that changes row by row, keep the row elements by id and add, update, move and remove only what changed:

```ts
private readonly _rows = new Map<string, TodoRow>();

private drawItems(items: Todo[]): void {
  const ids = new Set(items.map((item) => item.id));
  for (const [id, row] of this._rows) {
    if (!ids.has(id)) {
      row.remove();
      this._rows.delete(id);
    }
  }
  items.forEach((item, index) => {
    const row = this._rows.get(item.id) ?? this.createRow(item);
    if (row.todo.get() !== item) {
      row.todo.set(item); // unchanged items keep their object: their rows are not drawn again
    }
    const current = this._refs.list.children.item(index);
    if (current !== row) {
      this._refs.list.insertBefore(row, current); // new, or out of place: a move keeps its state and listeners
    }
  });
}
```

A row already in place is left alone: moving it would take its focus.

[recipes.md](recipes.md#a-list-that-changes-row-by-row) has the whole example.

## 12. `document.querySelector` into a component

```ts
// Bad: shadow DOM hides the component's nodes from the document
document.querySelector('#save-button');
```

Inside a component, use its refs or `this.getElement('#save')`. From outside, ask the component through a public method or property. To reach into a child's shadow root on purpose (a test, a quick script), `getElement('child-card >>> #title')` pierces it; in app code prefer the child's public API.

## 13. Global CSS expected to style inside

```css
/* Bad: in the page's stylesheet; it never reaches inside the shadow root */
quantity-stepper button { color: red; }
```

Styles go in `templateCss()`. From outside, style the host element itself, set CSS custom properties that the component's CSS reads (`var(--stepper-color, black)`), or target `::part(name)` when the component gives a node `part="name"`. Set `static readonly useShadowDom = false` only when the component must take global CSS on purpose.

Custom elements are `display: inline` by default: give `:host` a display.

## 14. A component that is not registered, or registered too late

Rule: **One selector, registered once, before use.**

- A tag in the DOM whose class was never registered stays an empty `HTMLElement`.
- A class written in JSX (`<UserCard />`) is created with `new UserCard()`, which throws `Illegal constructor` when the class is not registered yet: call `register()` at the bottom of its module, and import that module.
- A property set on an element before its class is registered is hidden by the class's own field once the element upgrades.
- A second class registered under a selector already taken is silently ignored: keep selectors unique.

## 15. Names an element already has

Rule: **No names an element already has.**

```ts
// Bad: replaces HTMLElement's own `title` and `hidden`; TypeScript may refuse the class as a page
title = 'Orders';
hidden = this.useChange(false, …);
translate(): void { … } // HTMLElement.translate is a boolean property
```

Use names of your own: `pageTitle()`, `collapsed`, `drawTexts()`. Others to avoid: `id`, `lang`, `dir`, `style`, `slot`, `part`, `children`, `remove`, `append`, `click`, `focus`, `blur`, `isConnected`, `shadowRoot`.

## 16. `innerHTML` with data

Rule: **Text through `textContent`.**

```ts
// Bad: a name holding <img onerror=…> runs a script
this._refs.greeting.innerHTML = `Hello <b>${user.name}</b>`;
```

```tsx
// Good
this._refs.name.textContent = user.name; // with <b id="name" /> in the template
```

## 17. Async work after the component left

```ts
// Bad: keeps fetching after removal, then writes into a component no longer shown
async onConnect(): Promise<void> {
  const response = await fetch('/api/orders');
  this._orders.set(await response.json());
}
```

```ts
// Good: the request is cancelled at disconnection, and nothing is written after it
async onConnect(): Promise<void> {
  try {
    const response = await fetch('/api/orders', { signal: this.killSignal });
    const orders = parseOrders(await response.json());
    if (this.isConnected) {
      this._orders.set(orders);
    }
  } catch (error) {
    if (!this.killSignal.aborted) {
      this.drawError(error);
    }
  }
}
```

Timers have no signal: start them in `onConnect()` and clear them in `onDisconnect()`.

## 18. A bus listener without a signal

```ts
// Bad: in plain JavaScript the missing signal is not caught, and the listener is never removed
appBus.register('logout', () => cache.clear());
```

Inside a component, `this.onBus(appBus, 'logout', …)` passes the kill signal. Outside components, pass an `AbortSignal` that ends when the listener should:

```ts
const controller = new AbortController();
appBus.register('logout', () => cache.clear(), controller.signal);
```

## 19. Router traps

- **No catch-all route**: a URL no route matches throws. End the routes with `notFound: { page: NotFoundPage, path: '/:rest' }`.
- **Order**: the first route that matches wins, and a `:param` matches across `/`. List specific routes before general ones.
- **Links reload the page**: plain `<a href="/orders">` reloads unless the router was made with `links: true` (history mode). In hash mode write `href="#/orders"`.
- **Pages made again**: every navigation creates a new page component, unless the page declares `onRoute(route)`.
- **Parameters are attributes in kebab case**: `:orderId` arrives as the `order-id` attribute, and as `route.params.orderId` in `onRoute`.

Details: [routing.md](routing.md).

## 20. Tests that do not wait for `onConnect`

```ts
// Bad: onConnect has not run yet, so the click listener is not there
document.body.append(stepper);
stepper.shadowRoot?.querySelector<HTMLButtonElement>('#increase')?.click();
expect(stepper.value.get()).toBe(2);
```

```ts
// Good
document.body.append(stepper);
await new Promise((resolve) => setTimeout(resolve)); // onConnect runs a task after the connection
stepper.shadowRoot?.querySelector<HTMLButtonElement>('#increase')?.click();
expect(stepper.value.get()).toBe(2);
```

What the template and the callbacks draw is there right after `appendChild`. See [testing.md](testing.md).

## 21. A second framework "to help"

Rule: **The platform first.**

No React, Preact, Vue, Lit, Alpine, htmx, a virtual DOM, signals or a state library inside a Jadis app, and no `classnames`-style package for a ternary. When something seems to need one, the answer is usually a `useChange` callback, a `Bus`, a `Map` of row elements, or a platform API. When Jadis truly lacks something every app needs, write the issue ([SKILL.md](../SKILL.md#what-jadis-lacks-or-gets-wrong-an-issue)).
