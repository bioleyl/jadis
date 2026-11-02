# Add Style with `templateCss()`

The `templateCss()` method defines the CSS styles applied to the component. It is meant to be overridden by subclasses that want to customize or extend the styling of their component.
The returned `string` should contain valid CSS rules. They become one stylesheet, made once and adopted by the shadow root of every instance (`adoptedStyleSheets`): a page of a hundred cards parses the card's CSS once. The styles stay encapsulated and never leak into the global stylesheet. Where shadow roots cannot adopt a stylesheet (jsdom), a `<style>` at the start of the shadow root holds them. Without a shadow DOM (`useShadowDom = false`), the `<style>` is added to the component itself and its rules apply to the whole document.

:::tip Give the host a display
A custom element is `display: inline` by default. Most components need `:host { display: block; }` (or `flex`, `grid`).
:::

## One stylesheet for every instance

Each component class keeps one stylesheet, made from the CSS of its first instance, and shares it with the others. So that they share it:

- **Return the same text for every instance.** Give an instance its own values through custom properties (`:host { gap: var(--gap, 1rem); }`, and `--gap` set on the element or by an attribute selector), not by writing them into the CSS. An instance whose CSS differs gets a stylesheet of its own, parsed for it alone, as a `<style>` would be.
- **Change a shared stylesheet for all, or not at all.** A rule inserted into `this.shadowRoot.adoptedStyleSheets[0]` changes every instance of the component. To change one, toggle a class or an attribute that the CSS already styles.

The root applies the component's stylesheet before the ones it adopted otherwise: a stylesheet another library adds to the root comes after the component's CSS, and wins over it at equal specificity.

A template that brings a stylesheet of its own (a `<style>` or a `<link rel="stylesheet">` in `templateHtml()`) keeps the component's CSS in a `<style>` before it, unshared: a root applies its adopted stylesheets after its own elements, and the template's rules would otherwise lose to the component's CSS where they win today.

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
**?inline** is Vite-specific and loads CSS as plain text in a variable, minified in the build. Prefer it to `?raw`,
which keeps the CSS as written: its comments and indentation would reach your users, since no bundler minifies what
is inside a string.
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
