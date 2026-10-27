# Server Rendering and VNodes

*Jadis* components render real DOM, not HTML strings. The helpers on this page bridge that model to code that has no browser in front of it: they describe a tree as plain data, turn it into an HTML string on the server, and hand the browser a matching markup that becomes a real shadow root as it parses.

JSX stays the way you write templates. Everything here is opt-in: a component that never ships to a server never imports any of it.

## VNodes

A **VNode** is a plain object describing an element or a component and its children. Unlike a template, it is inert: nothing is created until you mount it or render it to a string.

### `createVNode()`

Creates a VNode for a standard HTML tag or for a component selector.

```typescript
import { createVNode } from '@jadis/core';

const heading = createVNode('h2', {
  props: { class: 'title', 'data-testid': 'title' },
  children: ['Hello'],
});
```

#### Signature

```typescript
createVNode(
  tag: string | JadisConstructor,
  options?: { props?: Record<string, unknown>; children?: unknown[] }
): VNode;
```

| Parameter | Type | Description |
|---|---|---|
| `tag` | `string \| JadisConstructor` | A tag name, or a component class |
| `options.props` | `Record<string, unknown>` | Properties and attributes to set when the node is mounted |
| `options.children` | `unknown[]` | Nested VNodes, strings, numbers and DOM nodes. `null`, `undefined` and booleans are dropped |

### `createComponentVNode()`

The same, specialised for a component class, so the tag is always the class and props are typed against its public fields.

```typescript
import { createComponentVNode } from '@jadis/core';

const card = createComponentVNode(GreetingCard, { props: { name: 'Jadis' } });
```

#### Signature

```typescript
createComponentVNode<T extends Jadis>(
  Component: JadisConstructor<T>,
  options?: { props?: Record<string, unknown>; children?: unknown[] }
): VNode;
```

### `mountVNodes()`

Turns VNodes into real DOM and appends it to a parent — the imperative counterpart of returning a node from `templateHtml()`.

```typescript
import { createVNode, mountVNodes } from '@jadis/core';

const list = createVNode('ul', {
  children: ['one', 'two'].map((label) => createVNode('li', { children: [label] })),
});

mountVNodes(document.querySelector('#app') as HTMLElement, [list]);
```

#### Signature

```typescript
mountVNodes(parent: HTMLElement | ShadowRoot | DocumentFragment, children: Array<Node | VNode | string | number>): void;
```

A VNode whose tag is a component class instantiates that component, sets its props, and appends it — the component then runs its normal lifecycle. Values follow the JSX rules: keys holding a `-`, or starting with `data-` or `aria-`, become attributes; `on*` functions become listeners; everything else is assigned as a property.

## `renderToString()`

Serialises VNodes to an HTML string.

```typescript
import { createComponentVNode, renderToString } from '@jadis/core';

const html = renderToString([createComponentVNode(GreetingCard, { props: { name: 'Jadis' } })]);
```

#### Signature

```typescript
renderToString(vnodes: Array<Node | VNode | string | number>): string;
```

Text is escaped, boolean `true` props are written as bare attributes, camelCase props are hyphenated (`tabIndex` → `tab-index`) and void elements close themselves.

For a *Jadis* component, the output carries the component's own template as [declarative shadow DOM](https://developer.chrome.com/docs/essentials/rendering-streamed-content):

```html
<greeting-card name="Jadis">
  <template shadowrootmode="open" shadowrootserializable="true">
    <p>Hello, Jadis</p>
  </template>
</greeting-card>
```

The browser parses that template into a real shadow root before your script runs, so the content is styled and painted with no JavaScript involved.

:::warning Two constraints follow from how this works
- Props are written as **attributes**, so the component must read its input through `useAttributes()` (or `getAttribute()`) for a server-provided value to arrive. A field assigned from a JSX prop is set in the browser, not in the string.
- `renderToString()` calls `templateHtml()` and `templateCss()`, so those must not touch a live document. Keep them pure markup.
:::

## `hydrateSSR()`

Attaches the shadow roots that `renderToString()` described.

```typescript
import { hydrateSSR } from '@jadis/core';

hydrateSSR(); // searches the whole document
hydrateSSR(document.querySelector('#app') as Element); // or a subtree
```

#### Signature

```typescript
hydrateSSR(root?: Document | Element): void;
```

It looks for every `template[shadowrootmode]` inside `root` (the document by default) and calls `attachShadow()` on its host, which moves the template's content into the new shadow root. Hosts that already have a shadow root are left alone, and so are templates that are not inside an element.

:::info Modern browsers do this on their own
Browsers that parse declarative shadow DOM build the shadow roots while loading the page, so `hydrateSSR()` is the fallback for the ones that do not. Call it before the components connect — running it afterwards means the component rendered into its own shadow root and there is nothing left to adopt.
:::

## A complete round trip

```tsx
// shared/greeting-card.tsx
import { css, Jadis } from '@jadis/core';

export class GreetingCard extends Jadis {
  static readonly selector = 'greeting-card';

  private readonly _attributes = this.useAttributes({
    name: (value) => {
      this.getElement('#name').textContent = value ?? 'stranger';
    },
  });

  templateHtml(): Node {
    return (
      <p>
        Hello, <span id="name"></span>
      </p>
    );
  }

  templateCss(): string {
    return css`:host { display: block; }`;
  }
}
```

```ts
// server.ts — needs a DOM (a server-side one, or a browser-like runtime)
import { createComponentVNode, renderToString } from '@jadis/core';
import { GreetingCard } from './shared/greeting-card';

res.type('html').send(/* ... */ renderToString([createComponentVNode(GreetingCard, { props: { name: 'Jadis' } })]));
```

```ts
// client.ts — runs in the browser, before the components upgrade
import { hydrateSSR } from '@jadis/core';
import { GreetingCard } from './shared/greeting-card';

hydrateSSR();
GreetingCard.register();
```

The response paints `Hello, Jadis`; the client adopts the shadow root and the component takes over the same nodes, with `useAttributes` firing for `name` as it normally would.

## What this is not

*Jadis* has no hydration framework. There is no reconciliation, no diffing against the markup that arrived, and no way to resume an in-flight render. The server writes a first paint; the browser runs the component. If the two disagree, the component wins and the markup is simply wrong for a moment.

## See also

- [`createElement()`](../api/create-element.md) — DOM without JSX.
- [`toTemplate()`](../templating/to-template.md) — building component trees imperatively.
- [Templates](../guides/templates.md) — the usual, client-side way.
