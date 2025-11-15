# Add Style

You can style your component by using the `templateCSS()` method, which returns the CSS style as a string

```javascript
import { Jadis, css, createSelector } from '@jadis/core';

...

class ClickButton extends Jadis {
  static selector = createSelector('click-button');

  templateCss() { // [!code focus]
    return css`button { padding: 0.5rem; font-size: 1rem; }`; // [!code focus]
  } // [!code focus]

  templateHtml() {
    ...
  }

  ...
}
```

Another option for styling is to isolate your CSS in a separate file and import it

```javascript
import { Jadis, css, createSelector } from '@jadis/core';
import style from './your-css-file.css?inline'; 

class ClickButton extends Jadis {
  static selector = createSelector('click-button');

  templateCss() {
    return style;
  }

  templateHtml() {
    ...
  }

  ...
}

```

:::info
**?inline** is Vite specific in order to load css as plain text in a variable
:::

::: tip
CSS variables can traverse the shadow DOM
You might want to use them for font-styles, sizes and such
on the `::root` element.
:::

::: tip
The universal CSS selector `*` allows style to be applied through shadow DOM.
:::

::: tip
Check out [documentation about shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) and the [`:host()` pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:host_function).
:::

## Toggle classes based on a condition with `toggleClass()`

The `toggleClass()` method can add a class to the component or remove it based on a condition. You can then use the `:host` selector in your css to customize the styling.

### Syntax

:::code-group

```javascript
import { css, html, Jadis } from "@jadis/core";

export default class MyButton extends Jadis {
  static selector = createSelector("my-button");
  isError = false;

  refs = this.useRefs((ref) => {
    return {
      button: ref('button')
    }
  })

  templateHtml() {
    return html`
      <button>Toggle The Class</button>
      <p>My Paragraph</p>  
    `
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
    })
  }
}

MyButton.register();
```

```typescript
import { css, html, Jadis } from "@jadis/core";

export default class MyButton extends Jadis {
  static readonly selector = "my-button";
  private isError = false;

  private readonly refs = this.useRefs((ref) => {
    return {
      button: ref<HTMLButtonElement>('button')
    }
  })

  templateHtml(): DocumentFragment {
    return html`
      <button>Toggle The Class</button>
      <p>My Paragraph</p>  
    `
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
    })
  }
}

MyButton.register();
```

#### Parameters

- `className`: `<string>` the name of the class to toggle
- `condition`: `<boolean>` the binary condition used to toggle between classes. If `true`, class is added, if `false`, class is removed.

#### Return value

- no return value
