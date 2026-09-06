# JSX and `css()`

Jadis 1.0 uses JSX for component templates and keeps `css()` as the helper for interpolated component styles. The legacy `html()` tagged template helper is no longer part of the public API.

## JSX

Configure TypeScript or JavaScript with the automatic JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@jadis/core"
  }
}
```

Then return a real `Node` from `templateHtml()`:

```tsx
import { Jadis } from '@jadis/core';

class HelloCard extends Jadis {
  static readonly selector = 'hello-card';

  templateHtml(): Node {
    return <p>Hello from JSX</p>;
  }
}
```

For projects without a JSX transform, use [`createElement()`](./create-element.md).

## `css()`

Concatenates template literal parts with interpolated values into a CSS string.

### Signature

```typescript
css(strings: TemplateStringsArray, ...args: (string | number | boolean)[]): string;
```

### Example

```typescript
import { css, Jadis } from '@jadis/core';

class StyledCard extends Jadis {
  static readonly selector = 'styled-card';

  templateCss(): string {
    return css`
      :host { display: block; }
      :host { color: #3b82f6; }
    `;
  }
}
```

## See also

- [Templates](../guides/templates.md)
- [Styles](../templating/css.md)
