# 🧭 `useRefs` Helper

The `useRefs` helper creates **typed, lazy references** to elements within your component’s template using a **standard CSS selector**.  
It’s a convenient alternative to manually calling [`getElement()`](./get-element.md) for each element.

Instead of writing multiple getters, `useRefs` lets you define all your element references in one place — using a simple mapping function.

## 💡 Overview

`useRefs` takes a callback that receives a special `ref()` function.  
You call `ref(selector)` for each element you want to reference, and `useRefs` returns an object with **lazy getters** for those elements.

Each getter internally calls [`getElement()`](./get-element.md), ensuring the element exists and automatically traversing shadow DOM boundaries if needed.

## 📦 Return Type

The return value is an object (`ElementMap`) where each key corresponds to an element reference, and each property is a **getter** that returns the corresponding `HTMLElement` (or subtype).

## 🧪 Example

::: code-group

```javascript
import { html, Jadis, createSelector } from '@jadis/core';

class FormComponent extends Jadis {
  static selector = createSelector('form-component');

  templateHtml() {
    return html`
      <form>
        <input class="my-input" />
        <button>Submit</button>
      </form>
    `;
  }

  refs = this.useRefs((ref) => ({
    input: ref('input.my-input'),
    button: ref('button'),
  }));

  connectedCallback() {
    this.refs.button.addEventListener('click', () => {
      console.log('Input value:', this.refs.input.value);
    });
  }
}
```

```typescript
import { html, Jadis } from '@jadis/core';

class FormComponent extends Jadis {
  static readonly selector = 'form-component';

  templateHtml() {
    return html`
      <form>
        <input class="my-input" />
        <button>Submit</button>
      </form>
    `;
  }

  readonly refs = this.useRefs((ref) => ({
    input: ref<HTMLInputElement>('input.my-input'),
    button: ref('button'),
  }));

  connectedCallback() {
    this.refs.button.addEventListener('click', () => {
      console.log('Input value:', this.refs.input.value);
    });
  }
}
```

```javascript [js-doc]
// @ts-check
import { html, Jadis, createSelector } from '@jadis/core';

class FormComponent extends Jadis {
  static selector = createSelector('form-component');

  templateHtml() {
    return html`
      <form>
        <input class="my-input" />
        <button>Submit</button>
      </form>
    `;
  }

  refs = this.useRefs((ref) => ({
    /** @types HTMLInputElement */
    input: ref('input.my-input'),
    button: ref('button'),
  }));

  connectedCallback() {
    this.refs.button.addEventListener('click', () => {
      console.log('Input value:', this.refs.input.value);
    });
  }
}
```

:::

## 🧩 Advanced Example: Nested Components

You can also traverse into a child component’s shadow DOM using the `>>>` operator (same as [`getElement()`](./get-element.md)):


```javascript
this.useRefs((ref) => ({
  childButton: ref('child-component >>> button'),
}));
```

This retrieves the `<button>` inside the `child-component`’s shadow root.

## 🧰 Related Helpers

- [`getElement()`](./get-element.md) — Used internally by `useRefs` to perform element lookups.