# Attributes

The `useAttributes()` method creates reactive getters for HTML attributes on your component, eliminating repetitive `getAttribute()` calls and preventing typos.

## Signature

```typescript
this.useAttributes<T extends string>(...attributes: T[]): Record<T, string | null>;
```

### Parameters

- One or more attribute name strings.

### Return Value

An object with a getter for each specified attribute. Each getter calls `getAttribute()` internally, so the value is always current.

## Basic Example

```typescript
import { Jadis, html, createSelector } from '@jadis/core';

class Greeting extends Jadis {
  static selector = createSelector('greeting');

  readonly attrs = this.useAttributes('name', 'title');

  templateHtml(): DocumentFragment {
    return html`<h1>Hello, <span id="name"></span>!</h1>`;
  }

  onConnect(): void {
    this.getElement('#name').textContent = this.attrs.name ?? 'Guest';
  }
}
```

Usage:

```html
<greeting name="Alice" title="Developer"></greeting>
```

## Observing Attribute Changes

To react to attribute changes, declare them in `observedAttributes` and implement `attributeChangedCallback()`:

```typescript
class Greeting extends Jadis {
  static readonly selector = 'greeting';
  static readonly observedAttributes = ['name'];

  templateHtml(): DocumentFragment {
    return html`<h1>Hello, <span id="name"></span>!</h1>`;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'name') {
      this.getElement('#name').textContent = newValue ?? 'Guest';
    }
  }
}
```

## Best Practices

- Use `useAttributes()` when you need to read the same attribute multiple times.
- Combine with `observedAttributes` for reactive attribute handling.
- Attribute values are always strings — convert them as needed (`parseInt()`, `Boolean()`, etc.).

## See Also

- [Lifecycle](../guides/lifecycle.md) — Understanding when attributes are available.
