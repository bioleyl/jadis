# 🔍 `getElement` Helper

The `getElement` helper parses the DOM inside a Jadis component using a **standard CSS selector**. It’s the recommended way to access elements within your component’s template.

If you need to access an element inside another component (which is typically discouraged), you can use the special `>>>` operator. This tells getElement to traverse into a **shadow DOM boundary** before applying the next selector segment.

## 📦 Return Type

The return value is always an `HTMLElement`. You can cast it to a more specific element type as needed — for example, `HTMLButtonElement`, `HTMLInputElement`, or a custom class.

## 🧪 Example

::: code-group

```javascript
import { html, Jadis, createSelector } from '@jadis/core';

class ButtonComponent extends Jadis {
  static selector = createSelector('button-component');
  static template = html`<button>Click me</button>`;

  get buttonElement() {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');
  static template = html`<button-component></button-component>`;

  get childButtonComponent() {
    return this.getElement('button-component >>> button');
  }
}
```

```typescript
import { html, Jadis } from '@jadis/core';

class ButtonComponent extends Jadis {
  static readonly selector = 'button-component';
  static readonly template = html`<button>Click me</button>`;

  get buttonElement(): HTMLButtonElement {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static readonly selector = 'parent-component';
  static readonly template = html`<button-component></button-component>`;

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
  static template = html`<button>Click me</button>`;

  /** @returns {HTMLButtonElement} */
  get buttonElement() {
    return this.getElement('button');
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');
  static template = html`<button-component></button-component>`;

  /** @returns {HTMLButtonElement} */
  get childButtonComponent() {
    return this.getElement('button-component >>> button');
  }
}
```

:::
