# Templates

How templates are written: JSX, its rules, lists, conditions, forms, and the ways to build DOM without JSX.

## Contents

- JSX makes real nodes
- Props: what becomes what
- Children
- Components in JSX
- Conditions and lists
- Forms
- SVG and static markup
- Without JSX
- `toTemplate()` and VNodes

## JSX makes real nodes

With `"jsx": "react-jsx"` and `"jsxImportSource": "@jadis/core"`, the compiler turns JSX into calls to `@jadis/core/jsx-runtime`. Each call **creates the DOM node at once**: `<li>{name}</li>` is an `HTMLLIElement`, not a description of one. There is no React and no virtual DOM; never import `jsx`, `jsxs` or `Fragment` yourself.

So JSX works anywhere, not only in `templateHtml()`: a method can build a row and append it.

```tsx
private createRow(order: Order): HTMLLIElement {
  const row: HTMLLIElement = <li class="order"><span class="number" /> <span class="total" /></li>;
  this.drawRow(row, order);
  return row;
}
```

`JSX.Element` is typed `any`: annotate the variable with the element type you built, as above, when you need its members.

An expression in braces is evaluated **once**, when the node is made. `<p>{this._count.get()}</p>` shows the value of that moment and never changes: dynamic values are written by callbacks (`textContent`, properties, classes).

## Props: what becomes what

| You write | It becomes |
|---|---|
| `class="a b"` or `className="a b"` | The `class` attribute |
| `id="total"`, `type="button"`, `disabled={true}`, `value={text}`, `htmlFor="email"`, `tabIndex={0}` | The **property** of that name (`element.id`, `element.disabled`…). Use DOM property names: `htmlFor`, not `for`; `tabIndex`, not `tabindex` |
| `data-id={42}`, `aria-label="Close"`, any name with a hyphen | The attribute, as text |
| `attrs={{ role: 'tab', ariaSelected: 'true' }}` | Attributes; names in camel case become kebab case (`aria-selected`) |
| `props={{ value: 3 }}` | Properties, set explicitly |
| `onClick={(event) => …}` (any `on…` given a function) | A listener: `click` on a standard element. It lasts as long as the element |
| `style="color: red"` | The inline style, as text |
| `key={id}` | Nothing: there is no diffing |
| A value `undefined` | Nothing is set |

On a component, a prop sets the component's property: when that property is a `useChange` field, its `.set()` is called. It does **not** set the attribute of that name, so a `useAttributes` callback for it does not run. See [components.md](components.md#attributes-usechange-bound-to-an-attribute-useattributes).

Standard elements are type-checked per tag: an unknown prop on `<button>` is a compile error.

## Children

- Strings and numbers become text nodes; nodes are appended; arrays are flattened in order.
- `null`, `undefined`, `true` and `false` render nothing, so `{error && <p class="error">{error}</p>}` works for a value known when the node is made.
- Fragments group nodes without a wrapper: `<>…</>`. A fragment empties itself when appended: append it once.
- Text from data is safe in JSX children: it becomes a text node, never markup.

## Components in JSX

```tsx
import { OrderRow } from './order-row';       // importing the module registers the component

templateHtml(): Node {
  return (
    <section>
      <OrderRow order={this.order} onSelect={(order) => this.open(order)} />  {/* by class: typed */}
      <order-row data-variant="compact" />                                      {/* by tag: untyped */}
    </section>
  );
}
```

- **By class** (`<OrderRow />`): the element is created with `new OrderRow()`, so the class must be registered first (`register()` at the bottom of its module, and the module imported). Its public fields type the props, `useChange` fields by their value's type.
- **Events as props**: a component whose public `readonly events = this.useEvents<{ select: Order }>()` accepts `onSelect`, typed with the payload; `valueChange` gives `onValueChange`. The handler gets the payload (the event's `detail`) directly. The listener lasts as long as the element, which suits rows a parent creates.
- **By tag** (`<order-row />`): props are not checked. The tag's module must still be imported somewhere before the template runs, or the properties land on a plain element and are hidden once it upgrades.
- Children written between a component's tags become its light-DOM children, shown by its `<slot>`s.

## Conditions and lists

A condition or a list written in the template is drawn **once**. For one that changes, draw it in a callback.

**A part that shows or hides**: put it in the template, and toggle it.

```tsx
templateHtml(): Node {
  return (
    <>
      <p id="empty" hidden>No orders yet.</p>
      <ul id="orders" />
    </>
  );
}

private readonly _orders = this.useChange<Order[]>([], (orders) => {
  this._refs.empty.hidden = orders.length > 0;
  this.drawOrders(orders);
}, { immediate: true });
```

`hidden`, `classList.toggle(name, condition)`, `disabled` and `this.toggleClass()` on the host cover most cases. Replace a node (`node.replaceWith(other)`) when the two states share nothing.

**A list drawn once** (a fixed menu, options known at start):

```tsx
<ul>{MENU_ITEMS.map((item) => <li><a href={item.path}>{item.label}</a></li>)}</ul>
```

**A list that changes**: for a short list, redraw its rows in the callback (`list.replaceChildren(...orders.map((order) => this.createRow(order)))`). For a list whose rows have state, focus or listeners worth keeping, keep the rows in a `Map` by id and add, update, move and remove only what changed: [recipes.md](recipes.md#a-list-that-changes-row-by-row). Moving a row with `append` keeps its state: a move is not a reconnection.

## Forms

Use the platform: a `<form>`, named fields, `FormData`, and the browser's validation.

```tsx
templateHtml(): Node {
  return (
    <form id="form" noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <p id="error" class="error" hidden />
      <button type="submit">Subscribe</button>
    </form>
  );
}

onConnect(): void {
  this.on(this._refs.form, 'submit', (event) => {
    event.preventDefault();
    this.submit(new FormData(this._refs.form));
  });
}
```

- A `<form>` inside a shadow root submits as usual; its fields belong to it, not to a form outside the component.
- Read a field with its property (`input.value`, `checkbox.checked`), write it the same way.
- A component that should be a form field itself (taking part in an outer `<form>`) needs the platform's form-associated custom elements (`static formAssociated = true`, `attachInternals()`), which Jadis neither adds nor prevents.

## SVG and static markup

JSX creates every element with `document.createElement`, in the HTML namespace, and its types know HTML tags only: an `<svg>` written in JSX is refused by the type check and would not draw. For icons:

- an `<img src={iconUrl} alt="">` (Vite imports an `.svg` file as its URL);
- or static, trusted markup parsed once with a `<template>`, then cloned:

```tsx
const CLOSE_ICON = document.createElement('template');
CLOSE_ICON.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

templateHtml(): Node {
  return <button type="button" aria-label="Close">{CLOSE_ICON.content.cloneNode(true)}</button>;
}
```

`innerHTML` is fine for a constant written in the code; never for data.

## Without JSX

`createElement(tag, { props, attrs }, appendTo?)` creates an element, sets its properties (calling `.set()` on `useChange` fields) and attributes (names in camel case become kebab case), and appends it to `appendTo` when given:

```ts
import { createElement, Jadis } from '@jadis/core';

templateHtml(): Node {
  const card = createElement('article', { attrs: { class: 'card' } });
  createElement('h2', { props: { textContent: 'Orders' } }, card);
  createElement('ul', { attrs: { id: 'orders' } }, card);
  createElement(OrderSummary, { props: { total: 0 } }, card); // a component, by class
  return card;
}
```

The tag's name types the result (`createElement('input')` is an `HTMLInputElement`). This is how a project without a build step writes its templates.

## `toTemplate()` and VNodes

- `MyCard.toTemplate({ props, attrs }, slotted?)` creates an instance with properties, attributes and a copy of a fragment as its children: the imperative form of `<MyCard …>children</MyCard>`.
- `createVNode(tag, { props, children })`, `createComponentVNode(Class, { props, children })` and `mountVNodes(parent, vnodes)` describe a tree as data and create it later. Props follow the JSX rules. They are rarely needed: JSX and `createElement` cover templates.
