# Slots

Jadis components support [HTML slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot), enabling content projection from parent components. This is the standard Web Components mechanism for building composable, reusable components.

## Default Slots

A default slot accepts any content placed between the component's opening and closing tags:

```typescript
import { Jadis, html, createSelector } from '@jadis/core';

class Card extends Jadis {
  static selector = createSelector('card');

  templateHtml(): DocumentFragment {
    return html`
      <div class="card">
        <slot></slot>
      </div>
    `;
  }

  templateCss(): string {
    return css`
      .card {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
    `;
  }
}

Card.register();
```

Usage:

```html
<card>
  <p>This content is projected into the slot.</p>
</card>
```

## Named Slots

Components can define multiple slots, each identified by a `name` attribute:

```typescript
templateHtml(): DocumentFragment {
  return html`
    <div class="layout">
      <header><slot name="header"></slot></header>
      <main><slot></slot></main>
      <footer><slot name="footer"></slot></footer>
    </div>
  `;
}
```

Usage:

```html
<card>
  <h2 slot="header">My Title</h2>
  <p>Main content goes here.</p>
  <button slot="footer">Action</button>
</card>
```

## Using `toTemplate()` with Slots

The `toTemplate()` static method provides a convenient way to pass slotted content programmatically:

```typescript
templateHtml(): DocumentFragment {
  return html`
    ${Card.toTemplate(
      {},
      html`
        <h2 slot="header">My Title</h2>
        <p>Main content.</p>
      `
    )}
  `;
}
```

## Fallback Content

Place fallback content inside the `<slot>` element. It displays when no corresponding slotted content is provided:

```html
<div class="card">
  <slot>Default content when nothing is slotted</slot>
</div>
```

## Best Practices

- Prefer named slots for complex layouts with multiple insertion points.
- Use `toTemplate()` when constructing components programmatically.
- Slot content retains its own event listeners and lifecycle — it is not cloned.

## See Also

- [toTemplate()](./to-template.md) — Programmatic component instantiation.
- [Shadow DOM](../guides/shadow-dom.md) — Understanding light vs. shadow DOM boundaries.
