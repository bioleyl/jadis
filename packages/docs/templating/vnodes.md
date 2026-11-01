# VNodes

A tree can also be described as data before it becomes DOM. A **VNode** is a plain object describing an element or a component and its children. Unlike a template, it is inert: nothing is created until you mount it.

## `createVNode()`

Creates a VNode for a standard HTML tag or for a component selector.

```typescript
import { createVNode } from '@jadis/core';

const heading = createVNode('h2', {
  props: { class: 'title', 'data-testid': 'title' },
  children: ['Hello'],
});
```

### Signature

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

## `createComponentVNode()`

The same, specialised for a component class, so the tag is always the class and props are typed against its public fields.

```typescript
import { createComponentVNode } from '@jadis/core';

const card = createComponentVNode(GreetingCard, { props: { name: 'Jadis' } });
```

### Signature

```typescript
createComponentVNode<T extends Jadis>(
  Component: JadisConstructor<T>,
  options?: { props?: Record<string, unknown>; children?: unknown[] }
): VNode;
```

## `mountVNodes()`

Turns VNodes into real DOM and appends it to a parent — the imperative counterpart of returning a node from `templateHtml()`.

```typescript
import { createVNode, mountVNodes } from '@jadis/core';

const list = createVNode('ul', {
  children: ['one', 'two'].map((label) => createVNode('li', { children: [label] })),
});

mountVNodes(document.querySelector('#app') as HTMLElement, [list]);
```

### Signature

```typescript
mountVNodes(parent: HTMLElement | ShadowRoot | DocumentFragment, children: Array<Node | VNode | string | number>): void;
```

A VNode whose tag is a component class instantiates that component, sets its props, and appends it — the component then runs its normal lifecycle. Values follow the JSX rules: keys holding a `-`, or starting with `data-` or `aria-`, become attributes; `on*` functions become listeners; everything else is assigned as a property.

## See also

- [`createElement()`](../api/create-element.md) — DOM without JSX.
- [`toTemplate()`](./to-template.md) — building component trees imperatively.
- [Templates](../guides/templates.md) — the usual way, with JSX.
