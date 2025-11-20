# Get Elements from template with `getElement` Helper

The `getElement` helper parses the DOM inside a *Jadis* component using a **standard CSS selector**. It’s the recommended way to access elements within your component’s template.

If you need to access an element inside another component (which is typically discouraged), you can use the special `>>>` operator. This tells `getElement` to traverse into a **shadow DOM boundary** before applying the next selector segment.

## Signature

```typescript
this.getElement<T>(<query>): <HTMLElement>
```

### Parameters

- `T`: A generic type to specify the element type if it can't be infered
- `query`: The css query string to fetch the element in the component's dom. Automatically inferred if a tag name is provided (f.e. 'div' -> HTMLDivElement).
  Supports chained selectors using the format `parent-selector >>> child-selector >>> nested-selector`
  Each segment is resolved step-by-step, optionally entering shadow roots when present.

### Return value

- An `HTMLElement`. You can cast it to a more specific element type as needed, for example, `HTMLButtonElement`, `HTMLInputElement`, or a custom class.

## Example

::: code-group

```javascript
import { html, Jadis, createSelector } from '@jadis/core';

class ButtonComponent extends Jadis {
  static selector = createSelector('button-component');

  templateHtml() {
    return html`<button>Click me</button>`;
  }

  get buttonElement() {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  templateHtml() {
    return html`<button-component></button-component>`;
  }

  get childButtonComponent() {
    return this.getElement('button-component >>> button');
  }
}
```

```typescript
import { html, Jadis } from '@jadis/core';

class ButtonComponent extends Jadis {
  static readonly selector = 'button-component';

  templateHtml(): DocumentFragment {
    return html`<button>Click me</button>`;
  }

  get buttonElement(): HTMLButtonElement {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static readonly selector = 'parent-component';

  templateHtml(): DocumentFragment {
    return html`<button-component></button-component>`;
  }

  get childButtonComponent(): HTMLButtonElement {
    return this.getElement('button-component >>> button');
  }
}
```

```javascript [js-doc]
// @ts-check
import { html, Jadis, createSelector } from '@jadis/core';

class ButtonComponent extends Jadis {
  static selector = createSelector('button-component');

  templateHtml() {
    return html`<button>Click me</button>`;
  }

  /** @returns {HTMLButtonElement} */
  get buttonElement() {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  templateHtml() {
    return html`<button-component></button-component>`;
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
