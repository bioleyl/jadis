# Write the DOM with `templateHTML()`

The `templateHtml()` method defines the HTML structure of the component. It is intended to be overridden by subclasses or component implementations that need to supply their own visual layout. When implemented, this method should return a `DocumentFragment` containing the component’s rendered HTML.

:::info Info: *Jadis* provides a template helper `html`
that creates HTML templates using template literals,
allowing for easy creation of HTML structures with
interpolation. `html` returns a `<DocumentFragment>` containing
the HTML structure. It is used in the shown examples.
:::

## Signature

```typescript
templateHtml?(): DocumentFragment;
```

### Parameters

- none
  
### Return value

- `DocumentFragment` A fragment representing the component’s HTML template.
This enables efficient DOM manipulation, as `DocumentFragment` can be constructed and modified without triggering layout or rendering until it is inserted into the document.

## Example

Override this method in your component to provide a custom HTML template. Typically, you will create a `DocumentFragment` manually or by inserting other *Jadis* components.

:::code-group

```javascript
templateHtml(){
    return html`
      <div class="container">
        <p>Hello There</p>
      </div>
    `;
  }
```

```typescript
templateHtml(): DocumentFragment{
    return html`
      <div class="container">
        <p>Hello There</p>
      </div>
    `;
  }

```

:::

## Notes on shadow DOM

By default, all *Jadis* components are rendered using a shadow DOM. This provides style and markup encapsulation, preventing unintended side effects from global CSS and ensuring predictable component behavior.

In some cases, it may be desirable to render a component without a Shadow DOM. This can be achieved by setting the static readonly property `useShadowDom` to `false`.

## When to disable the Shadow DOM

Disabling the Shadow DOM is recommended in the following scenarios:

- **Global styling requirements**: when a component must inherit styles from a global stylesheet or a CSS framework that relies on global selectors.
- **Integration with third party libraries**: when using libraries or scripts that expect direct access to the DOM tree and do not support Shadow DOM boundaries.
- **Progressive enhancement or legacy environments**: when building components intended to enhance existing markup or integrate into legacy codebases where Shadow DOM usage is not feasible.
- **SEO or tooling constraints**: when spedific tools, crawlers, or testing utilities do not fully support Shadow DOM and require access to the light DOM.

### Example without a shadow Dom

```typescript
  export class TestComponentNoShadow extends Jadis {
  static readonly selector = 'test-no-shadow';
  static readonly useShadowDom = false;

  templateHtml() {
    // this template won't be inside
    // a shadow DOM
  }
}

TestComponentNoShadow.register();
```
