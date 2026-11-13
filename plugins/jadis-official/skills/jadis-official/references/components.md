# Components

Everything a component is made of. Signatures in short form: [api.md](api.md).

## Contents

- Anatomy
- Lifecycle in detail
- Refs and `getElement`
- State: `useChange`
- Attributes: `useChange` bound to an attribute, `useAttributes`
- Which tool for which data
- A component's public API
- Listeners, the kill signal, timers
- Styles
- Shadow DOM and slots
- Your own base class
- Plain JavaScript

## Anatomy

```tsx
import { Jadis } from '@jadis/core';

export class OrderCard extends Jadis {
  static readonly selector = 'order-card';      // required: lowercase, a hyphen, unique
  static readonly useShadowDom = true;          // the default; false renders into the element's own children

  templateHtml(): Node { … }                    // the structure, drawn once
  templateCss(): string { … }                   // the styles, one stylesheet shared by every instance
  onConnect(): void { … }                       // a task after each connection
  onDisconnect(): void { … }                    // a microtask after each removal
}

OrderCard.register();                           // defines the custom element; safe to call twice
```

- `static readonly selector` is a valid custom element name: starts with a letter, lowercase, at least one hyphen (`order-card`, `app-order-card`). `createSelector('order-card')` checks it and throws on a bad name; plain JavaScript needs it for the type (see [Plain JavaScript](#plain-javascript)).
- `register()` defines the element under its selector unless the name is taken. A second class with the same selector is ignored without a word.
- All four instance methods are optional. A component with no template is a valid element that only runs code.
- `this.isConnected` is Jadis's own flag: true from the connection until the disconnection has run.
- `MyCard.toString()` gives the selector: `` `${MyCard}` `` and `ref(MyCard.toString())` work.

## Lifecycle in detail

| Moment | What runs, in order | What you can use |
|---|---|---|
| `new`, `document.createElement`, the HTML parser | The constructor: shadow root attached; field initializers (`useRefs`, `useChange`, `useEvents`, `useAttributes`, `useTranslation`) | Nothing of the template: refs throw. `set()` on a `useChange` field is queued. |
| First connection | `templateCss()`, `templateHtml()`, appended once; attribute callbacks for the attributes present; queued `useChange` changes, once per field with the latest value; `useTranslation` callbacks | Refs, in every callback |
| A task later | `onConnect()`, unless the component was removed meanwhile | Everything; add listeners here |
| Removal from the document | A microtask later: the kill signal aborts (listeners added with `this.on`, `events.register`, `onBus`, or the signal go), then `onDisconnect()` | The DOM is kept as it is |
| Put back later | No template drawn; attribute callbacks for the attributes that changed while away; changes queued while away; `useTranslation` callbacks; a task later, `onConnect()` again | The same nodes as before |
| Moved (`append`, `insertBefore`, `replaceChildren`, `moveBefore` of an element in the page) | Nothing | Listeners, signal and state as they were |

Consequences:

- **Listeners go in `onConnect()`**, or in JSX `on…` props on the template's own nodes. A listener added in the constructor is never removed.
- **`onConnect()` must be safe to repeat.** Guard one-time work by the state (`if (this._orders.get()) return;`) or by what the DOM holds, not by a "connected once" flag.
- **Async work checks the connection.** Give `this.killSignal` to `fetch`; after an `await`, check `this.isConnected` before writing to the DOM. Each connection gets a new signal: read `this.killSignal` at the time you start the work.
- **What a property set before the connection draws** is there right after `appendChild`, before the paint: the change was queued and applied during the connection.
- **Attributes win over earlier properties.** At the connection, attribute callbacks run before the queued changes, and a queued change calls back with the value current then: an attribute present on the element gives the field its value, even when a property was set before.

## Refs and `getElement`

```tsx
private readonly _refs = this.useRefs((ref) => ({
  form: ref('form'),                         // typed HTMLFormElement from the tag name
  email: ref<HTMLInputElement>('#email'),    // typed by the generic
  submit: ref<HTMLButtonElement>('button[type="submit"]'),
  summary: ref(OrderSummary),                // a Jadis class: found by its selector, typed as OrderSummary
}));

this._refs.email.value;
this._refs.summary.total.set(42);
```

- Each access runs `querySelector` on the shadow root (or the element without shadow DOM). Nothing is cached: a ref always finds the current node.
- A query that finds nothing **throws** (`… element is not reachable`). For a node that may be absent, use `this.shadowRoot?.querySelector(…)` and handle `null`.
- Refs find the first match. For several nodes, query them: `this.shadowRoot?.querySelectorAll('li')`, or keep them in a `Map` as you create them.
- Light-DOM children passed through a `<slot>` are not in the shadow root: read them with `this.querySelector(…)`, `this.children`, or `slot.assignedElements()`.
- `this.getElement(query)` is the one-off form, with the same typing and the same throw. `>>>` pierces nested shadow roots: `this.getElement('order-summary >>> #total')`. In app code, prefer the child's public API to reaching into its shadow root.

## State: `useChange`

```ts
private readonly _status = this.useChange<'idle' | 'saving' | 'saved'>('idle', (status, previous) => {
  this._refs.save.disabled = status === 'saving';
  this.toggleClass(`status-${previous}`, false);
  this.toggleClass(`status-${status}`, true);
}, { immediate: true });

this._status.get();                    // read
this._status.set('saving');            // write a value
this._count.set((count) => count + 1); // write from the previous value
```

- **Not a re-render.** The callback is where you change the DOM. Nothing else happens on a change.
- **Before the connection**, `set()` queues the change. At the connection, the callback runs once with the latest value and the value before the first queued change.
- **The value changes at once; only the callback waits.** `get()` always gives the latest value, so a callback may read other fields. At the connection, the queued callbacks run in the order they were queued (for `immediate` fields, the order of the fields). When several fields draw one part, give each the same drawing method, which reads them all: the order then does not matter.
- **`immediate: true`** runs the callback for the initial value too (at the connection, before the first paint). Without it, the callback first runs on the first `set()`.
- **Once connected**, every `set()` calls the callback, even with an equal value: keep it cheap, and make it draw the value whole so a second run changes nothing.
- **`oldValue` is the previous value itself.** Replace arrays and objects (`set((list) => [...list, item])`), never change them in place.
- **Any value** can be stored. A function value goes through an updater, `set(() => callback)`, since `set(fn)` calls `fn` as an updater.
- **Public `useChange` fields are the component's properties.** A JSX prop of the same name calls `.set()`, and so does `createElement(Tag, { props: { … } })`.
- Writing the same value from inside its own callback calls it again: never `set()` a field from its own callback.

## Attributes: `useChange` bound to an attribute, `useAttributes`

**A field bound to an attribute** is the usual way to take an attribute:

```ts
readonly label = this.useChange('', (label) => { this._refs.label.textContent = label; }, { attribute: 'label' });
readonly max = this.useChange(10, (max) => this.drawMax(max), { attribute: 'max' });
readonly open = this.useChange(false, (open) => this.drawOpen(open), { attribute: 'open' });
readonly tags = this.useChange<string[]>([], (tags) => this.drawTags(tags), {
  attribute: 'tags',
  parse: (value) => (value === null ? [] : value.split(',')),
});
```

- `attribute` turns `immediate` on. The field is set from the attribute at the connection and on every change of the attribute; the field can still be set as a property.
- Default parsers come from the initial value's type: a **string** takes the attribute's text (the initial value when absent); a **number** takes `Number(text)` (the initial value when absent, blank or not a number); a **boolean** is true when the attribute is present, whatever its text, as in HTML.
- Any other type needs `parse: (value: string | null) => T`. A type built on the class's type parameter (`class ChoiceList<Value extends string>`) needs it too.
- Setting the field does **not** write the attribute back. A callback that writes an attribute on the host must skip a value the attribute already has, or the observer calls it back without end.
- On a server render, the field's value set in code is written back as the attribute (JSON for lists and objects, when `parse` reads it back the same). See [server-rendering.md](server-rendering.md).

**`useAttributes`** gives raw callbacks and getters, for an attribute you only react to:

```ts
private readonly _attributes = this.useAttributes({
  variant: (value, oldValue) => {
    this.toggleClass(`variant-${oldValue}`, false);
    this.toggleClass(`variant-${value ?? 'default'}`, true);
  },
});

this._attributes.variant; // string | null, read now with getAttribute()
```

- No `static observedAttributes` and no list of names: `useAttributes` observes the attributes it has callbacks for.
- Callbacks run at the connection for the attributes present, then on each change while connected, a microtask after it (changes are batched by a `MutationObserver`). At a reconnection they run only for the attributes set, changed or removed while the component was away: an unchanged attribute does not put its value back over what was set since.
- Prefer a bound `useChange` field over a `useAttributes` entry that only calls `.set()`.

## Which tool for which data

| Data | Use |
|---|---|
| A value the component shows and that changes | A private `useChange` field |
| A value a parent passes in code (objects, lists, numbers) | A public `useChange` field: a property, a JSX prop |
| Configuration written in HTML (`<my-dialog open>`) | A `useChange` field bound to an attribute |
| A reaction to an attribute with no value to keep | `useAttributes` |
| A value that never shows (a cache, a timer id, a `Map` of rows) | A plain private field |
| A command (`open()`, `reset()`, `focusFirstError()`) | A public method |
| Something the component reports | `useEvents` on a public `readonly events` field |
| Content the user of the component chooses | A `<slot>` |

## A component's public API

Keep it small: attributes and properties for input, methods for commands, events for output, slots for content. Everything else is `private`. A parent never reaches into a child's shadow root. Name events after what happened (`select`, `valueChange`, `close`), with a typed payload.

## Listeners, the kill signal, timers

```ts
onConnect(): void {
  this.on(this._refs.search, 'input', () => this.filter(this._refs.search.value)); // an element
  this.on(window, 'keydown', (event) => this.closeOnEscape(event));               // window
  this.on(document, 'visibilitychange', () => this.pauseWhenHidden());            // document
  socket.addEventListener('message', (event) => this.receive(event), { signal: this.killSignal }); // any other target
  this._timer = window.setInterval(() => this.refresh(), REFRESH_MS);
}

onDisconnect(): void {
  window.clearInterval(this._timer);
}
```

- `this.on()` is typed for elements, `window` and `document`, with the event's own type (`keydown` gives a `KeyboardEvent`).
- `this.killSignal` is an `AbortSignal` that aborts at disconnection. Give it to `fetch`, to `addEventListener` on any other target, and to anything else that takes a signal.
- `this.toggleClass(name, condition)` adds or removes a class on the host, for `:host(.name)` styles.

## Styles

```tsx
import styles from './order-card.css?inline';

templateCss(): string {
  return styles;
}
```

```css
:host { display: block; padding: var(--order-card-padding, 1rem); }
:host([hidden]) { display: none; }
:host(.selected) { outline: 2px solid var(--accent, royalblue); }
::slotted(img) { max-width: 100%; }
.total { font-weight: bold; }
```

- `:host([hidden]) { display: none; }` keeps the `hidden` property working on the host: a `:host { display: … }` rule wins over the browser's own rule for `[hidden]`.
- `templateCss()` becomes **one stylesheet per component class**, adopted by every instance's shadow root (`adoptedStyleSheets`, no `<style>` element). Return the same text for every instance. An instance's own values come from custom properties, attributes (`:host([variant="danger"])`) or classes on the host.
- Put the CSS in a file beside the component and import it with `?inline` (Vite processes and minifies it). Not `?raw`, which keeps comments and spaces as written. A library built with `build.minify: false` also sets `build.cssMinify: 'lightningcss'`.
- The `css` tagged template joins values into CSS text: ``css`:host { gap: ${GAP_PX}px; }` ``. It does not escape anything.
- A `<style>` element is used instead in jsdom, without shadow DOM, and when the template holds a `<style>` or `<link rel="stylesheet">` of its own.
- Vitest leaves CSS imports empty, `?inline` included, unless its config sets `test: { css: true }`.
- Expose styling hooks with custom properties (`--order-card-padding`) and `part="name"` on inner nodes (styled from outside with `order-card::part(name)`).

## Shadow DOM and slots

Shadow DOM is on by default: the template lives in an open shadow root, styles stay inside, and the page's CSS does not reach in.

```tsx
templateHtml(): Node {
  return (
    <article>
      <header><slot name="title" /></header>
      <slot />
      <footer><slot name="actions" /></footer>
    </article>
  );
}
```

```html
<info-panel>
  <h2 slot="title">Shipping</h2>
  <p>Ships in two days.</p>
  <button slot="actions" type="button">Change</button>
</info-panel>
```

- The slotted nodes stay in the light DOM, children of the host: the page's CSS styles them, `::slotted()` styles their top level from inside.
- React to slotted content changing with `this.on(slot, 'slotchange', …)`, and read it with `slot.assignedElements()`.
- In JSX, children written between a component's tags are appended as its light-DOM children, which its slots show: `<InfoPanel><p>…</p></InfoPanel>`.
- `static readonly useShadowDom = false` renders the template into the element's own children, after those it was given. Use it only when global CSS or outside scripts must reach the nodes on purpose: slots and style isolation are lost.

## Your own base class

A set of components that share a helper extends an abstract class of your own:

```ts
export abstract class AppComponent extends Jadis {
  protected whenConnected(action: () => void): void {
    this.isConnected ? action() : this.onConnectActions.push(action);
  }
}
```

`onConnectActions` is the queue of actions that run at the next connection, after the attribute callbacks. Keep the contract of `Jadis`: never override its lifecycle methods.

## Plain JavaScript

The same API works in JavaScript, typed through JSDoc and `checkJs`:

```js
/** @jsxImportSource @jadis/core */
import { Bus, createSelector, Jadis } from '@jadis/core';

export class SearchBox extends Jadis {
  static selector = createSelector('search-box'); // a plain string would be typed `string`, not a selector

  events = this.useEvents({ submit: String });    // a schema of constructors types the payloads

  refs = this.useRefs((ref) => ({ input: ref('input') }));

  templateHtml() {
    return <input type="search" />;
  }
}

/** @type {Bus<{ notify: string, logout: undefined }>} */
export const appBus = new Bus();
```

Without JSX, build templates with `createElement` (see [templating.md](templating.md#without-jsx)).
