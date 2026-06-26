# Shadow DOM

By default, all Jadis components render their templates inside a [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM). This provides style and markup encapsulation, preventing CSS leakage and ensuring predictable component behavior.

## How It Works

When a Jadis component is instantiated, the constructor attaches an open shadow root if `useShadowDom` is `true` (the default):

```typescript
class MyComponent extends Jadis {
  static readonly selector = 'my-component';
  // useShadowDom defaults to true — shadow DOM is used automatically
}
```

The template returned by `templateHtml()` and the styles from `templateCss()` are injected into this shadow root.

## Disabling Shadow DOM

In some cases, you may want your component to render in the light DOM instead:

```typescript
class MyComponent extends Jadis {
  static readonly selector = 'my-component';
  static readonly useShadowDom = false;
}
```

When `useShadowDom` is `false`, the template is appended directly to the component element itself.

## When to Disable Shadow DOM

| Scenario | Reason |
|---|---|
| **Global styling** | Your component must inherit styles from a global stylesheet or CSS framework that relies on global selectors. |
| **Third-party integration** | Libraries or scripts expect direct access to the DOM tree and don't support shadow boundaries. |
| **Legacy environments** | Existing codebases or tooling may not fully support Shadow DOM. |
| **SEO / testing tools** | Some crawlers or testing utilities require light DOM access. |

## CSS Variables and Shadow DOM

CSS custom properties (variables) defined on `:root` or ancestor elements **do** traverse shadow boundaries:

```css
/* Global stylesheet */
:root {
  --font-family: 'Inter', sans-serif;
  --color-primary: #3b82f6;
}
```

```css
/* Component stylesheet */
:host {
  font-family: var(--font-family);
  color: var(--color-primary);
}
```

This is the recommended pattern for theming: define variables globally and consume them in component styles.

## Accessing Elements Across Shadow Boundaries

The `getElement()` helper supports the `>>>` combinator to traverse into child shadow roots:

```typescript
// Access an element inside a child component's shadow DOM
const innerButton = this.getElement('child-component >>> button');
```

See [getElement()](../dom/get-element.md) for full details.

## See Also

- [Templates](./templates.md) — How templates are rendered into the DOM.
- [getElement()](../dom/get-element.md) — Cross-shadow DOM element access.
