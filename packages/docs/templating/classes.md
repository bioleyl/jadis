# Toggle classes based on a condition with `toggleClass()`

The `toggleClass()` method can add a class to the component or remove it based on a condition. You can then use the `:host` selector in your css to customize the styling.

## Signature

```typescript
this.toggleClass(<className>, <condition>): void
```

### Parameters

- `className`: a `string` that represents the name of the class to toggle
- `condition`:  a `boolean` the binary condition used to toggle between classes. If `true`, class is added, if `false`, class is removed.

### Return value

- no return value

## Examples

:::code-group

```jsx
/// <reference types="@jadis/core/jsx-runtime" />
/** @jsxImportSource @jadis/core */

import { css, createSelector, Jadis } from '@jadis/core';

export default class MyButton extends Jadis {
  static selector = createSelector('my-button');
  isError = false;

  refs = this.useRefs((ref) => ({
    button: ref('button')
  }));

  templateHtml() {
    return (
      <>
        <button>Toggle The Class</button>
        <p>My Paragraph</p>
      </>
    )
  }

  templateCss() {
    return css`
      p {
        color: white;
      }  

      :host(.error) p {
        color: red;
      }
    `
  }

  onConnect() {
    this.on(this.refs.button, 'click', () => {
      this.isError = !this.isError;
      this.toggleClass('error', this.isError)
    });
  }
}

MyButton.register();
```

```tsx
import { css, Jadis } from '@jadis/core';

export default class MyButton extends Jadis {
  static readonly selector = 'my-button';
  private isError = false;

  private readonly refs = this.useRefs((ref) => ({
    button: ref<HTMLButtonElement>('button')
  }));

  templateHtml(): Node {
    return (
      <>
        <button>Toggle The Class</button>
        <p>My Paragraph</p>
      </>
    )
  }

  templateCss(): string {
    return css`
      p {
        color: white;
      }  

      :host(.error) p {
        color: red;
      }
    `
  }

  onConnect(): void {
    this.on(this.refs.button, 'click', () => {
      this.isError = !this.isError;
      this.toggleClass('error', this.isError)
    });
  }
}

MyButton.register();
```

:::
