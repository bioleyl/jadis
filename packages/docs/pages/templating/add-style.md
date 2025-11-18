# Add Style with `templateCss()`

The `templateCss()` method defines the CSS styles applied to the component. It is meant to be overridden by subclasses that want to customize or extend the styling of their component.
The returned `string` should contain valid CSS rules. These styles are injected into the component’s shadow DOM,
ensuring proper encapsulation and preventing leakage into the global stylesheet.

## Signature

```typescript
  templateCss(): string;
```

### Parameters

- none

### Return values

- A `string` containing the CSS rules for the component.

## Examples

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

## Isolate CSS in a separate file

A more convenient way to style a component is to isolate CSS in a separate file that you import with the special
`?inline` query if you are using Vite.

```javascript
import { Jadis, createSelector, css, createSelector } from '@jadis/core';
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

See [documentation about toggling classes in components](../templating/toggle-class.md).

:::info
**?inline** is Vite specific in order to load css as plain text in a variable.
:::

::: tip
CSS variables can traverse the shadow DOM
You might want to use them for font-styles, sizes and such
on the `:root` element.
:::

::: tip
The universal CSS selector `*` allows style to be applied through shadow DOM.
:::

::: tip
Check out [documentation about shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) and the [`:host()` pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:host_function).
:::
