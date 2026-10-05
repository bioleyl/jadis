# Add Style with `templateCss()`

The `templateCss()` method defines the CSS styles applied to the component. It is meant to be overridden by subclasses that want to customize or extend the styling of their component.
The returned `string` should contain valid CSS rules. These styles are injected into the component’s shadow DOM,
ensuring proper encapsulation and preventing leakage into the global stylesheet. Without a shadow DOM (`useShadowDom = false`), the `<style>` is added to the component itself and its rules apply to the whole document.

:::tip Give the host a display
A custom element is `display: inline` by default. Most components need `:host { display: block; }` (or `flex`, `grid`).
:::

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
import { Jadis, createSelector } from '@jadis/core';
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

See [documentation about toggling classes in components](./classes.md).

:::info
**?inline** is Vite-specific and loads CSS as plain text in a variable.
:::

::: tip
CSS variables can traverse the shadow DOM
You might want to use them for font-styles, sizes and such
on the `:root` element.
:::

::: tip
Inherited properties, such as `color` and `font-family`, pass from the page into the shadow DOM through the host. Other global rules, `*` included, do not reach inside: style the internals from `templateCss()`, or expose parts with [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part).
:::

::: tip
Check out [documentation about shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) and the [`:host()` pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:host_function).
:::
