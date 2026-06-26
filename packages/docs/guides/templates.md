# Templates

The `templateHtml()` method defines the HTML structure of a Jadis component. It returns a `DocumentFragment` that is appended to the component's root (shadow or light DOM) when the component connects.

Jadis provides the `html()` tagged template literal helper for creating HTML with interpolation:

```typescript
import { Jadis, html } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  templateHtml(): DocumentFragment {
    const greeting = 'Hello';
    return html`
      <div class="container">
        <p>${greeting}, World!</p>
      </div>
    `;
  }
}
```

## Interpolation

The `html()` helper supports interpolating values of different types:

| Type | Behavior |
|---|---|
| `string` / `number` / `boolean` | Converted to text content |
| `Node` (HTMLElement, Text, etc.) | Inserted as a child node |
| `Node[]` | All nodes inserted sequentially |
| `undefined` / `null` | Rendered as empty string |

### String Interpolation

```typescript
const name = 'Jadis';
return html`<p>Welcome, ${name}!</p>`;
// → <p>Welcome, Jadis!</p>
```

### Node Interpolation

```typescript
const listItems = [1, 2, 3].map(i => document.createElement('li'));
return html`<ul>${listItems}</ul>`;
// → <ul><li>1</li><li>2</li><li>3</li></ul>
```

## The `html()` Helper

### Signature

```typescript
html(strings: TemplateStringsArray, ...values: unknown[]): DocumentFragment
```

### Parameters

- `strings` — The template literal strings (provided automatically by JavaScript)
- `values` — The interpolated values at each `${...}` position

### Return Value

A `DocumentFragment` containing the rendered HTML. Using a fragment is efficient because it can be constructed off-screen and inserted into the DOM in a single operation.

## The `css()` Helper

For styles, Jadis provides the `css()` tagged template literal helper:

```typescript
import { css } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  templateCss(): string {
    return css`
      :host { display: block; }
      .title { font-size: 1.5rem; color: #333; }
    `;
  }
}
```

### Signature

```typescript
css(strings: TemplateStringsArray, ...args: (string | number | boolean)[]): string
```

Returns a plain CSS string suitable for injection into a `<style>` element.

## Best Practices

- Keep templates focused — complex logic belongs in methods, not template expressions.
- Use `useRefs()` or `getElement()` to access elements after rendering.
- Prefer `css()` for inline styles; use external `.css?inline` imports when using Vite.
- For dynamic content that changes frequently, use `useChange()` with element references instead of re-rendering the template.

## See Also

- [Styles](../templating/css.md) — Adding CSS to components.
- [useChange()](../state/use-change.md) — Reactive state management.
- [useRefs()](../dom/use-refs.md) — Element references for dynamic updates.
