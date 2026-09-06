---
name: jadis-app
description: Build TypeScript web applications with Jadis, a thin layer over native Web Components. Covers project setup with or without a bundler, JSX or createElement templating, the component lifecycle, state, communication, and routing.
---

# Building applications with Jadis

Jadis is a thin layer over native Web Components: no virtual DOM, no framework runtime, no reactivity system. You define custom elements, render real DOM once, and update it yourself. Never add React, Vue, or a second component model on top.

Official documentation: <https://bioleyl.github.io/jadis/>

## The lifecycle model (read this first)

Verified against `base-component.ts`:

1. **Constructor** — the shadow root is attached. Nothing is rendered yet. Field initializers (`useRefs`, `useChange`, `useEvents`) run here.
2. **First connection** — `templateHtml()` and `templateCss()` run **once** and are appended to the shadow root. Then `onConnect()` runs **asynchronously**, on the next task — not synchronously during `appendChild`.
3. **Disconnection** — the internal kill signal aborts. Every listener registered with `on()`, `useEvents().register()`, or `onBus()` is removed automatically. The rendered DOM is **kept**.
4. **Reconnection** — `onConnect()` runs **again**, attribute callbacks re-fire for currently set attributes, and the **same DOM** is reused. The template is never re-rendered.

Consequences:

- Wire **all** listeners inside `onConnect()`. Cleanup is automatic; manual `removeEventListener` is a smell.
- Never assume a single connection. Don't cache "connected once" state on the instance.
- In tests, don't assert DOM right after `appendChild`; wait for the task (Playwright's auto-waiting or `waitForFunction` handles this).
- `useChange` updates made before connection are queued and applied when the component connects.

## Setup

### Scaffolded projects

```bash
npx @jadis/create ts my-app        # TypeScript + Vite + JSX
npx @jadis/create js my-app        # checked JavaScript + Vite + JSX
npx @jadis/create vanilla my-app   # no bundler, no JSX, CDN import map
```

Then:

```bash
cd my-app
npm install      # not needed for vanilla
npm run dev      # vanilla: npx serve . or any static HTTP server
```

### Manual Vite setup (TypeScript + JSX)

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install
npm install @jadis/core
```

Required changes:

1. Rename the entrypoint to `.tsx` if it contains JSX (JSX in `.js` files must use `.jsx`).
2. Update `index.html`: `<script type="module" src="/src/main.tsx"></script>`.
3. Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@jadis/core"
  }
}
```

The `react-jsx` mode does **not** require React; it only names the automatic JSX transform. The compiler emits imports from `@jadis/core/jsx-runtime`. Never import `jsx`, `jsxs`, or `Fragment` manually.

Minimal entrypoint:

```tsx
import { Jadis } from '@jadis/core';

class AppShell extends Jadis {
  static readonly selector = 'app-shell';

  templateHtml(): Node {
    return <main><h1>My Jadis app</h1></main>;
  }
}

AppShell.register();
document.body.appendChild(document.createElement('app-shell'));
```

### No build step at all

Browsers execute neither JSX nor TypeScript. Two options:

**Plain JavaScript with `createElement`** (simplest):

```html
<script type="importmap">
  {
    "imports": {
      "@jadis/core": "https://esm.sh/@jadis/core@1.0.0"
    }
  }
</script>
<script type="module" src="/src/main.js"></script>
```

```js
import { createElement, Jadis } from '@jadis/core';

class HelloWorld extends Jadis {
  static selector = 'hello-world';

  templateHtml() {
    return createElement('p', { props: { textContent: 'Hello without JSX' } });
  }
}

HelloWorld.register();
```

**Precompiled TypeScript/JSX** — transpile with `tsc` (no bundler), serve the output:

```bash
npx tsc --jsx react-jsx --jsxImportSource @jadis/core \
  --module ESNext --target ES2020 --outDir dist
```

The emitted code imports `@jadis/core/jsx-runtime`, so the import map needs both entries:

```json
{
  "imports": {
    "@jadis/core": "https://esm.sh/@jadis/core@1.0.0",
    "@jadis/core/jsx-runtime": "https://esm.sh/@jadis/core@1.0.0/jsx-runtime"
  }
}
```

Pin the CDN version to the release you develop against. Serve over HTTP — `file://` does not work with modules and import maps.

## Component anatomy

```ts
import { Jadis } from '@jadis/core';

export class GreetingCard extends Jadis {
  static readonly selector = 'greeting-card';

  private readonly _refs = this.useRefs((ref) => ({
    message: ref<HTMLParagraphElement>('#message'),
  }));

  templateHtml(): Node {
    const paragraph = document.createElement('p');
    paragraph.id = 'message';
    paragraph.textContent = 'Hello';
    return paragraph;
  }

  templateCss(): string {
    return ':host { display: block; }';
  }
}

GreetingCard.register();
```

Conventions:

- `static readonly selector` must be a valid custom-element name containing a hyphen. `createSelector('my-card')` validates it at startup.
- `templateHtml()` must return a real `Node` (element or `DocumentFragment`), not an HTML string.
- `templateCss()` returns a CSS string injected as one `<style>` into the shadow root. Use the `css` tagged-template helper when interpolating values.
- Register each component once; `register()` is idempotent but importing the module once is cleaner.

### Shadow DOM

Shadow DOM is **on by default**. This means:

- Global stylesheets do not style component internals.
- Style the host with `:host` and slotted content with `::slotted(...)`.
- Set `static readonly useShadowDom = false` only when light-DOM integration (global CSS, third-party DOM access) is an intentional requirement.

## Reading and updating DOM

Three tools, in order of preference:

**Refs** — stable getters for your own template:

```ts
private readonly _refs = this.useRefs((ref) => ({
  input: ref<HTMLInputElement>('#input'),
  submit: ref<HTMLButtonElement>('#submit'),
}));
```

**`getElement(query)`** — one-off queries, including piercing nested shadow roots with `>>>`:

```ts
const nested = this.getElement('child-component >>> #inner');
```

**`useChange`** — a value with a change callback. Not a reactive system; you still update the DOM explicitly:

```ts
private readonly _count = this.useChange(0, (value) => {
  this._refs.value.textContent = String(value);
}, { immediate: true });

// read: this._count.get()
// write: this._count.set(5) or this._count.set((v) => v + 1)
```

`{ immediate: true }` runs the callback for the initial value (deferred until connection). Update only the nodes that changed — never rebuild the whole template for a local change.

**Attributes** — the callback-object API:

```ts
private readonly _attributes = this.useAttributes({
  name: (value, oldValue) => {
    this._refs.name.textContent = value ?? '';
  },
});
```

- Do not declare `static observedAttributes` and do not pass an attribute list; `useAttributes` handles observation itself.
- Getters (`this._attributes.name`) read synchronously via `getAttribute()`.
- Change callbacks after connection are asynchronous (`MutationObserver` batching).
- Callbacks re-fire on reconnection for currently set attributes.

## JSX templating

```tsx
templateHtml(): Node {
  return (
    <p>
      Count: <span id="value" />
      <button id="increment" type="button">Increment</button>
    </p>
  );
}
```

- Standard HTML elements are type-checked per element (a wrong prop on `<button>` is a compile error).
- Use `class` or `className`; `data-*` and `aria-*` are supported.
- Event props work: `onClick={(event) => ...}`.
- Children can be nested JSX, arrays, strings, or numbers; `null`/`boolean` render nothing.
- Components compose as JSX: `<user-card name="Jadis" />` (registered) or `<UserCard />` (class reference).
- Fragments: `<>...</>`.

## Communication

**Parent → child**: direct calls on public methods/properties, or attributes. The parent owns the relationship.

```ts
this._refs.child.updateTitle('Hello'); // child exposes updateTitle
```

**Child → parent**: custom events via `useEvents`. Expose the handler as a public field so the parent can register:

```ts
class SearchBox extends Jadis {
  static readonly selector = 'search-box';

  readonly events = this.useEvents<{ submit: string }>();

  private submit(): void {
    this.events.emit('submit', this._refs.input.value);
  }
}

// parent, in onConnect():
this._refs.search.events.register('submit', (query) => { ... });
```

`useEvents` listeners are bound to the kill signal — registered in `onConnect`, removed on disconnect.

**Cross-component / services**: `Bus`. Unrelated components share a bus instance:

```ts
export const appBus = new Bus<{ notification: { text: string } }>();

// in a component:
this.onBus(appBus, 'notification', ({ text }) => { ... }); // auto-cleanup

// outside components, an AbortSignal is REQUIRED:
appBus.register('notification', callback, abortController.signal);
```

Use custom events for local parent/child relationships, a Bus for application-wide messages. Don't route every interaction through a global bus.

## Composition

- Slots: `<slot />` and named `<slot name="header" />` for consumer content.
- `MyComponent.toTemplate(options, slotted)` creates an instance with slotted content, for building trees imperatively.
- Prefer a small public API (attributes, properties, methods, events, slots) over reaching into another component's shadow root with `>>>`.

## Routing

```ts
import { defineRoutes, Router } from '@jadis/core';

const routes = defineRoutes({
  home: { page: HomePage, path: '/' },
  profile: { page: ProfilePage, path: '/profile/:id' },
});

const router = new Router(routes, { mode: 'history' }); // or 'hash'
router.mountOn(document.getElementById('app') ?? document.body);

router.goto('profile', { id: '42' });
```

- `mountOn` takes an `HTMLElement`; use `getElementById`, not `querySelector` (which returns `Element`).
- Params become attributes on the page component: read `id` with `useAttributes` or `getAttribute('id')`.
- Group routes with `defineRouteGroup('/group', { ... }, { rootComponentSelector: 'group-root' })`; names concatenate (`groupHome`).
- `goto` throws on unknown routes and missing params — handle both deliberately.
- Register page and root components before navigating to them.

## Testing an application

- **Unit (Vitest + jsdom)**: pure logic, helpers, failure paths.
- **Browser (Playwright)**: things jsdom can't reproduce faithfully — connection/reconnection timing, shadow DOM and slots, `MutationObserver` delivery, custom events, bus cleanup, history/hash navigation, keyboard interaction.
- In Playwright, rely on `expect(locator).toHaveText(...)` auto-waiting instead of sleeping; it correctly handles the asynchronous `onConnect`.
- Test empty, error, and disconnected states, not only the happy path.
