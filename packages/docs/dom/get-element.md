# Get Elements from template with `getElement` Helper

The `getElement` helper parses the DOM inside a *Jadis* component using a **standard CSS selector**. It’s the recommended way to access elements within your component’s template.

If you need to access an element inside another component (which is typically discouraged), you can use the special `>>>` operator. This tells `getElement` to traverse into a **shadow DOM boundary** before applying the next selector segment.

## Signature

```typescript
this.getElement<Tag extends keyof HTMLElementTagNameMap>(
  query: Tag
): HTMLElementTagNameMap[Tag];

this.getElement<Element extends HTMLElement>(query: string): Element;
```

A known tag name is inferred automatically; pass an element type for a CSS selector or custom element:

### Parameters

- `Element`: The element type to use when a selector's type cannot be inferred.
- `Tag`: A known HTML tag name, which maps to its corresponding `HTMLElement` subtype.
- `query`: The CSS selector to find in the component's DOM. For example, `'div'` returns an `HTMLDivElement` and `this.getElement<HTMLInputElement>('#input')` returns an `HTMLInputElement`.
  Supports chained selectors using the format `parent-selector >>> child-selector >>> nested-selector`
  Each segment is resolved step-by-step, optionally entering shadow roots when present.

### Return value

- The inferred element type for a known tag name, or the explicit generic type for a CSS selector. The method throws if the selector cannot be found.

## Example

::: code-group

```jsx
/// <reference types="@jadis/core/jsx-runtime" />
/** @jsxImportSource @jadis/core */

import { Jadis, createSelector } from '@jadis/core';

class ButtonComponent extends Jadis {
  static selector = createSelector('button-component');

  templateHtml() {
    return <button>Click me</button>;
  }

  get buttonElement() {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  templateHtml() {
    return <button-component></button-component>;
  }

  get childButtonComponent() {
    return this.getElement('button-component >>> button');
  }
}
```

```tsx
import { Jadis } from '@jadis/core';

class ButtonComponent extends Jadis {
  static readonly selector = 'button-component';

  templateHtml(): Node {
    return <button>Click me</button>;
  }

  get buttonElement(): HTMLButtonElement {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static readonly selector = 'parent-component';

  templateHtml(): Node {
    return <button-component></button-component>;
  }

  get childButtonComponent(): HTMLButtonElement {
    return this.getElement('button-component >>> button');
  }
}
```

```jsx [js-doc]
// @ts-check
/// <reference types="@jadis/core/jsx-runtime" />
/** @jsxImportSource @jadis/core */

import { Jadis, createSelector } from '@jadis/core';

class ButtonComponent extends Jadis {
  static selector = createSelector('button-component');

  templateHtml() {
    return <button>Click me</button>;
  }

  /** @returns {HTMLButtonElement} */
  get buttonElement() {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  templateHtml() {
    return <button-component></button-component>;
  }

  /** @returns {HTMLButtonElement} */
  get childButtonComponent() {
    return this.getElement('button-component >>> button');
  }
}
```

:::

:::tip
Check out the related helper [`useRefs()`](./use-refs.md): Create multiple typed element references using a single mapping function.
:::
