# html() / css()

Tagged template literal helpers for creating HTML and CSS content in Jadis components.

## html()

Creates a `DocumentFragment` from a template literal with interpolation support.

### Signature

```typescript
html(strings: TemplateStringsArray, ...values: unknown[]): DocumentFragment;
```

### Interpolation Types

| Value Type | Behavior |
|---|---|
| `string`, `number`, `boolean` | Rendered as text content |
| `Node` | Inserted as a child node |
| `Node[]` | All nodes inserted sequentially |
| `undefined`, `null` | Rendered as empty string |

### Example

```typescript
import { html } from '@jadis/core';

const name = 'World';
const items = [1, 2, 3].map(i => document.createElement('li'));

const fragment = html`
  <div>
    <p>Hello, ${name}!</p>
    <ul>${items}</ul>
  </div>
`;
```

## css()

Concatenates template literal parts with interpolated values into a CSS string.

### Signature

```typescript
css(strings: TemplateStringsArray, ...args: (string | number | boolean)[]): string;
```

### Example

```typescript
import { css } from '@jadis/core';

const primaryColor = '#3b82f6';

const styles = css`
  :host { display: block; }
  button {
    background: ${primaryColor};
    padding: 0.5rem;
  }
`;
```

### Usage in Components

```typescript
class MyComponent extends Jadis {
  templateCss(): string {
    return css`
      :host { display: block; }
      .title { color: #333; }
    `;
  }
}
```

## See Also

- [Templates](../guides/templates.md) — Template literals in Jadis.
- [Styles](../templating/css.md) — Adding CSS to components.
