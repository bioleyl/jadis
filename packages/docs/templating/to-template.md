# Add *Jadis* components to the template

*Jadis* components can be used directly as JSX elements in `templateHtml()`. This is the recommended approach for embedding components.

## Using JSX (recommended)

Simply reference the component class as a JSX tag:

```typescript
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

Props are passed as JSX attributes. Jadis components automatically map attributes to their properties:

```typescript
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

### Passing slotted content (children)

JSX naturally handles children through children nodes:

```typescript
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

## Using `toTemplate()` (legacy)

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
