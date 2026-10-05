# Add *Jadis* components to the template

*Jadis* components can be used directly as JSX elements in `templateHtml()`. This is the recommended approach for embedding components.

## Using JSX (recommended)

Use the component's tag name, or its class (`<UserProfile />`), whose public fields then type the props:

```tsx
templateHtml(): Node {
  return (
    <div>
      <h1>Dashboard</h1>
      <user-profile user={this.userData} />
      <counter-component />
    </div>
  );
}
```

### Passing props

A JSX prop on a component sets a **property** of the element, not an HTML attribute. When the property is a `useChange` field, its `.set()` is called:

```tsx
templateHtml(): Node {
  return (
    <name-input
      label="Your name"
      placeholder="Enter your name"
      class="my-input"
    />
  );
}
```

Here `label` and `placeholder` are assigned as `element.label` and `element.placeholder`; only `class` becomes an attribute. A `useAttributes` callback for `label` therefore does **not** run. To set attributes, use `attrs` or a hyphenated name (`data-*`, `aria-*`, `my-attr`):

```tsx
<name-input attrs={{ label: 'Your name' }} data-size="large" />
```

On standard elements, use the DOM property names: `htmlFor`, `tabIndex`.

:::warning Register components before rendering them
Import (and so register) a component's module before a template renders it. A property set on an element that is not upgraded yet is shadowed by the class field once the element upgrades.
:::

### Passing slotted content (children)

JSX naturally handles children through children nodes:

```tsx
templateHtml(): Node {
  return (
    <collapsible-panel>
      <h1 class="title">My Title</h1>
      <p class="content">My content</p>
    </collapsible-panel>
  );
}
```

### With class and className

Both `class` and `className` work:

```typescript
templateHtml(): Node {
  return (
    <user-card className="profile-card" title="John" />
  );
}
```

## Using `toTemplate()` programmatically

The `toTemplate()` static method is still available for creating component instances programmatically:

```typescript
templateHtml(): Node {
  return (
    <div>
      {MyComponent.toTemplate(
        { props: { label: 'Your name' } },
        document.createDocumentFragment()
      )}
    </div>
  );
}
```

### With slotted content

```typescript
const fragment = document.createDocumentFragment();
fragment.appendChild(document.createTextNode('Hello'));

const component = MyComponent.toTemplate(
  { attrs: { class: 'container' }, props: { title: 'My Title' } },
  fragment
);
```
