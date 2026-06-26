# Styles

The `templateCss()` method defines CSS styles scoped to a Jadis component. These styles are injected into the component's shadow DOM, ensuring complete encapsulation from global stylesheets.

## Signature

```typescript
templateCss?(): string;
```

### Return Value

A CSS string containing rules that will be wrapped in a `<style>` element and inserted into the shadow root.

## Basic Example

```typescript
import { Jadis, css, createSelector } from '@jadis/core';

class ClickButton extends Jadis {
  static selector = createSelector('click-button');

  templateCss(): string {
    return css`
      :host {
        display: inline-block;
      }
      button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: none;
        border-radius: 4px;
        background: #3b82f6;
        color: white;
        cursor: pointer;
      }
      button:hover {
        background: #2563eb;
      }
    `;
  }

  templateHtml(): DocumentFragment {
    return html`<button>Click me</button>`;
  }
}
```

## Using the `css()` Helper

The `css()` tagged template literal allows interpolation of CSS values:

```typescript
templateCss(): string {
  const primaryColor = '#3b82f6';
  return css`
    button {
      background: ${primaryColor};
      padding: 0.5rem;
    }
  `;
}
```

## External Stylesheets (Vite)

When using Vite, you can import CSS files as raw strings using the `?inline` query parameter:

```typescript
import style from './button.css?inline';

class ClickButton extends Jadis {
  templateCss(): string {
    return style;
  }
}
```

This is the recommended approach for larger style blocks, keeping styles in dedicated `.css` files.

## The `:host` Selector

The `:host` selector targets the component element itself. Use it to control the component's display behavior and dimensions:

```css
:host {
  display: block;       /* Fills the full width */
  display: inline-block; /* Flows with text */
}
```

### Conditional Styling with `:host()`

You can combine `:host` with class selectors for conditional styling. Use `toggleClass()` to toggle classes based on state:

```typescript
templateCss(): string {
  return css`
    :host(.error) p {
      color: red;
    }
    :host(.disabled) {
      opacity: 0.5;
      pointer-events: none;
    }
  `;
}
```

## Best Practices

- Use `:host` to control the component's own layout.
- Prefer CSS variables for theming — they traverse shadow boundaries.
- Keep styles scoped to the component; avoid targeting external elements.
- Use `*` selector when you need styles to apply through shadow DOM boundaries (e.g., resetting form element defaults).

## See Also

- [Toggle Classes](./classes.md) — Conditionally apply CSS classes.
- [Shadow DOM](../guides/shadow-dom.md) — Understanding encapsulation.
