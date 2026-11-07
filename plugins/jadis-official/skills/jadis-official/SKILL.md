---
name: jadis-official
description: Build and change web apps with Jadis (`@jadis/core`), a thin layer over native Web Components where real DOM is drawn once and changed by hand, with no virtual DOM, no reactivity and no framework runtime. Teaches it from zero (the lifecycle, JSX or createElement templates, state with useChange, attributes, events, buses, routing, translations, server rendering with @jadis/fastify, tests), the mistakes that React, Vue and Lit habits cause in it, and a self-check to run before delivering. Load it before writing, reviewing or debugging code that imports `@jadis/core`, extends `Jadis`, calls `useRefs`, `useChange`, `useEvents`, `useAttributes`, `onBus`, `Router` or `Translator`, sets `jsxImportSource` to `@jadis/core`, or uses `@jadis/fastify` or `@jadis/create`, and before starting an app on Jadis, even when the request only says web components or custom elements in a project that depends on Jadis.
license: MIT
---

# Jadis

Jadis is a small TypeScript library over native Web Components. A component is a custom element: a class that extends `Jadis`. It draws its template **once**, as real DOM, then **you** change the nodes that need it when its state changes. There is no virtual DOM, no re-render, no reactive system and no framework runtime. Never bring React, Vue, Lit, a virtual DOM or a state library on top of it.

Written for `@jadis/core@1.8.0`. Documentation: <https://bioleyl.github.io/jadis/> · Source: <https://github.com/bioleyl/jadis>

## How to use this skill

1. **First time in a session**: read this file, then [references/agent-mistakes.md](references/agent-mistakes.md). It shows what models write from React, Vue and Lit habits, and what Jadis needs instead.
2. **Before writing**: open the reference for the task (table in [Where to look](#where-to-look)). Check every API you call against the installed version ([The installed API](#the-installed-api)).
3. **While writing**: follow the [rules](#rules). Copy the shape of [the component below](#a-complete-component).
4. **Before delivering**: run the [self-check](#self-check-before-delivery) on your diff, fix what it finds, and report.
5. **Asked to review Jadis code**: walk the rules and the mistakes file over the code, and report each finding with its place, the rule's name, the code quoted and a fix. Don't edit unless asked.

The project's own rules (`AGENTS.md`, `CLAUDE.md`, its README) and its consistent conventions win over this skill.

## The model, if you know React

| You would write (React, Vue, Lit) | In Jadis |
|---|---|
| A function or class that renders again on every change | `templateHtml()` returns a `Node`, built once at the first connection, never again |
| `useState`, `ref()`, `@property`, `this.requestUpdate()` | `this.useChange(initial, (value) => /* change the nodes */)`: a value with a callback, not a re-render |
| JSX in `render()` with `{state}` interpolated | JSX in `templateHtml()` for the structure; dynamic text written in callbacks with `textContent` |
| `ref`, `this.$refs`, `@query` | `this.useRefs((ref) => ({ name: ref('#name') }))`: getters that query the shadow root |
| `useEffect` and its cleanup | `onConnect()`, and listeners added with `this.on()`, removed at disconnection on their own |
| Props | Public fields and methods; JSX props set **properties**; attributes through `useChange(…, { attribute })` |
| Callback props, `$emit`, `dispatchEvent` | `readonly events = this.useEvents<{ save: Item }>()` then `this.events.emit('save', item)` |
| Context, Redux, Pinia, stores | A `Bus` shared by the components that need it, or a plain module |
| `key` and list diffing | You add, move and remove the row elements yourself, usually from a `Map` of id to element |
| React Router, vue-router | `new Router(defineRoutes({…})).mountOn(element)` |
| i18n libraries | `Translator` with `defineTranslations`, and `this.useTranslation()` |

## A complete component

The shape to copy. One file per component, its CSS beside it.

```tsx
// src/components/quantity-stepper.tsx
import { Jadis } from '@jadis/core';

import styles from './quantity-stepper.css?inline';

const MIN_QUANTITY = 1;

export class QuantityStepper extends Jadis {
  // A custom element name: lowercase, with a hyphen, unique in the app.
  static readonly selector = 'quantity-stepper';

  // Public and named `events`: a parent registers on it, and JSX accepts `onValueChange`.
  readonly events = this.useEvents<{ valueChange: number }>();

  // The state. The `value` attribute, a JSX prop `value={3}` and `stepper.value.set(3)` all set it.
  readonly value = this.useChange(MIN_QUANTITY, (value) => this.drawValue(value), { attribute: 'value' });

  // Getters on the template: each access queries the shadow root. Never read them in the constructor.
  private readonly _refs = this.useRefs((ref) => ({
    decrease: ref<HTMLButtonElement>('#decrease'),
    increase: ref<HTMLButtonElement>('#increase'),
    output: ref('output'),
  }));

  // Runs once, at the first connection. Structure only: the callbacks fill in the values.
  templateHtml(): Node {
    return (
      <div class="stepper">
        <button id="decrease" type="button" aria-label="Decrease">−</button>
        <output />
        <button id="increase" type="button" aria-label="Increase">+</button>
      </div>
    );
  }

  templateCss(): string {
    return styles;
  }

  // A task after each connection. Listeners added with this.on() go at disconnection.
  onConnect(): void {
    this.on(this._refs.decrease, 'click', () => this.step(-1));
    this.on(this._refs.increase, 'click', () => this.step(1));
  }

  private step(delta: number): void {
    this.value.set((value) => Math.max(MIN_QUANTITY, value + delta));
    this.events.emit('valueChange', this.value.get());
  }

  // Draws the value it is given, whole: it may run again with the same value.
  private drawValue(value: number): void {
    this._refs.output.textContent = String(value);
    this._refs.decrease.disabled = value <= MIN_QUANTITY;
  }
}

QuantityStepper.register();
```

```css
/* src/components/quantity-stepper.css */
:host { display: inline-block; }
.stepper { display: flex; align-items: center; gap: 0.5rem; }
```

A parent uses it by its class in JSX (importing the class registers it), or by its tag in HTML:

```tsx
<QuantityStepper value={2} onValueChange={(quantity) => this.drawTotal(quantity)} />
```

```html
<quantity-stepper value="2"></quantity-stepper>
```

## The lifecycle

1. **Constructor**: the shadow root is attached, empty. Field initializers run (`useRefs`, `useChange`, `useEvents`, `useAttributes`). Nothing is rendered: reading a ref throws.
2. **First connection** (`appendChild` into the document): `templateCss()` and `templateHtml()` run **once**. Then, in the same call: attribute callbacks, then `useChange` values set before the connection (once each, with the latest value) and `immediate` ones, then `useTranslation` callbacks. All before the browser paints.
3. **`onConnect()`** runs **a task later** (`setTimeout`), not during `appendChild`; not at all if the component was removed meanwhile.
4. **Removal**: a microtask later, the kill signal aborts, which removes every listener added with `this.on()`, `events.register()` and `onBus()`, then `onDisconnect()` runs. The DOM is **kept**.
5. **Putting it back**: the same DOM is reused, the template is **not** drawn again, attribute callbacks run again for the attributes present, and `onConnect()` runs again.
6. **A move** (`append`, `insertBefore`, `replaceChildren`, `moveBefore` of an element already in the page) is not a removal: nothing runs, listeners stay.

So: `onConnect()` must be safe to run again, guard one-time work by what the DOM already holds, pass `this.killSignal` to `fetch`, and check `this.isConnected` after an `await`. Details: [references/components.md](references/components.md#lifecycle-in-detail).

## Rules

Each rule has a short name; use the name when you cite it in a review.

### The model

1. **Draw once, change in place.** `templateHtml()` builds the structure once. A change of state changes only the nodes it concerns (`textContent`, `classList.toggle`, a property, adding or removing one row). Never rebuild the template, never call `templateHtml()` yourself, never assign `innerHTML` to redraw.
2. **Callbacks draw the whole value.** A `useChange` callback writes the state it is given, so running it twice with the same value changes nothing. Replace values (`set((list) => [...list, item])`), never change them in place.
3. **Listeners live with the connection.** Listeners on your own template's nodes: a JSX `on…` prop, or `this.on()` in `onConnect()`. Listeners on anything that outlives the component (`window`, `document`, a bus, another component's events): in `onConnect()`, through `this.on()`, `onBus()` or `events.register()`, or with `{ signal: this.killSignal }`. Never `removeEventListener` by hand, never add them in the constructor.
4. **`onConnect` runs again.** It runs after every reconnection, on the same DOM. Make it safe to repeat; guard one-time work (filling a list, a first fetch) by what the DOM or the state already holds, not a "done once" flag.
5. **Never override the custom element callbacks.** `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback` and `static observedAttributes` belong to Jadis. Use `onConnect`, `onDisconnect`, `useAttributes` and `useChange(…, { attribute })`.

### Components and data

6. **One selector, registered once, before use.** `static readonly selector` is lowercase with a hyphen and unique: a second class on a taken name is silently ignored. Call `register()` at the bottom of the component's module, and import a child's module before a parent renders it.
7. **Properties down, events up.** A parent sets a child's public `useChange` fields (JSX props), calls its methods, or sets attributes. A child reports with `this.events.emit()` on a public `readonly events` field. A `Bus` is for app-wide messages only.
8. **JSX props set properties.** `<user-card name="Ada" />` assigns `element.name`, it does not set the `name` attribute. Attributes come from `attrs={{ name: 'Ada' }}` and from hyphenated names (`data-*`, `aria-*`).
9. **Text through `textContent`.** Write data into the DOM with `textContent`, properties, or JSX children. Never `innerHTML` with data: it is a script injection.
10. **Styles in `templateCss()`, the same for every instance.** It becomes one stylesheet shared by all instances. Give the host a display (`:host { display: block; }`), and an instance its own values through CSS custom properties or classes, never through different CSS text. Shadow DOM is on: global CSS does not reach inside.
11. **No names an element already has.** A component is an `HTMLElement`: never declare `title`, `hidden`, `id`, `lang`, `dir`, `style`, `slot`, `translate`, `remove`, `click`, `focus`, `isConnected` or another inherited member as a field or method of your own.

### Platform and verification

12. **The platform first.** `fetch` with a signal, `URL`, `Intl`, `<form>`, `<dialog>`, `<template>`, CSS. No package for what a few lines of DOM do, and never a second component model.
13. **Real APIs only.** Check every Jadis call against the installed declarations before using it. Never write what an API "should" look like.
14. **Test the timing.** In jsdom tests, what callbacks draw is there after `appendChild`; what `onConnect` does needs a task. Run the type check, the tests, and look at the page in a browser.

## Where to look

Open only what the task needs.

| When you | Read |
|---|---|
| Start a project, set up Vite, TypeScript, JSX, plain JavaScript, or no build step | [references/setup.md](references/setup.md) |
| Write a component: refs, `useChange`, attributes, styles, shadow DOM, slots, the lifecycle in detail | [references/components.md](references/components.md) |
| Write templates: JSX rules, lists, conditions, forms, `createElement`, `toTemplate`, VNodes | [references/templating.md](references/templating.md) |
| Connect components: parent and child, events, buses, services | [references/communication.md](references/communication.md) |
| Add pages and navigation: routes, links, parameters, query, `onRoute`, `canLeave` | [references/routing.md](references/routing.md) |
| Translate the app | [references/translations.md](references/translations.md) |
| Render on the server, or with `@jadis/fastify` | [references/server-rendering.md](references/server-rendering.md) |
| Write tests (Vitest, jsdom, Playwright) | [references/testing.md](references/testing.md) |
| Want a worked example: a list, a form, a page that loads data, a dialog, an app shell | [references/recipes.md](references/recipes.md) |
| Need a signature | [references/api.md](references/api.md) |
| Are new to Jadis, or review code | [references/agent-mistakes.md](references/agent-mistakes.md) |

## The installed API

- The version: `version` in `node_modules/@jadis/core/package.json`. Its commented declarations, which work offline: `node_modules/@jadis/core/dist/dts/` (`base-component.d.ts` for the `Jadis` class, `helpers/`, `router/`, `translation/`, `server/`).
- The documentation of that version, as Markdown: `https://raw.githubusercontent.com/bioleyl/jadis/core-v<version>/packages/docs/<section>/<page>.md`, the page's path on the site (`/routing/routed-pages` gives `routing/routed-pages.md`).
- An API this skill names that the installed version lacks is newer: suggest updating (`npm view @jadis/core version`), or do without it.
- An app on jlib (`@syware/jlib`, `jl-*` components built on Jadis) also needs the `jlib` skill.

## Self-check before delivery

Walk your diff once. Fix every "no", or say why it stays.

1. Is the template drawn once, with every change made to the nodes it concerns, and no `innerHTML` redraw?
2. Does every `useChange` callback draw the whole value it gets, with values replaced, not changed in place?
3. Is every listener on something outside the component added in `onConnect()` through `this.on()`, `onBus()`, `events.register()` or the kill signal, with no `removeEventListener` by hand?
4. Is `onConnect()` safe to run again, with `this.killSignal` given to `fetch` and `this.isConnected` checked after an `await`?
5. Is no custom element callback overridden, and no `observedAttributes` declared?
6. Does each new component have a unique hyphenated selector, `register()` at the bottom of its module, its children imported before it renders them, and `:host` given a display?
7. Do parents set properties or call methods, children emit on a public `readonly events`, and only app-wide messages go through a bus?
8. Are attributes set with `attrs` or hyphenated names where an attribute is meant, and is data written with `textContent`, never `innerHTML`?
9. Does no field or method reuse a name `HTMLElement` already has?
10. Did you check every Jadis API against the installed declarations?
11. Do the type check and the tests pass, and did you look at the page in a browser? Say which you could not run.

Then report what the pass changed, as `<file>:<line> — <what changed>`, and end with one line: `jadis self-check: 2 fixed` or `jadis self-check: clean`.

## What Jadis lacks or gets wrong: an issue

A bug in Jadis, or something every app has to work around, is fixed once in Jadis for all apps.

- Look for an existing issue first: `gh issue list --repo bioleyl/jadis --search "…"`.
- Write the issue: what the app needed, what Jadis does instead (its version, a few lines that show it, the console's message), and what would solve it. One issue per problem.
- Show it to the person, who files it, or file it with `gh issue create --repo bioleyl/jadis` once they agree: the issue is public.
- Meanwhile keep the app's workaround small and in one place, with a comment linking the issue.
