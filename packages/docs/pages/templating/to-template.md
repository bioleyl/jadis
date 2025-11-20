# Add *Jadis* components to the template with `toTemplate()`

*Jadis* provides the `toTemplate()` method on components which makes it really easy to
use them in the template and populate slots with the `slotted` parameter. It provides an options object that allows passing props and attributes.

## Signature

```typescript
toTemplate(<options?>, <slotted?>): <DocumentFragment>
```

### Parameters

- `options`: optional, an `<object>`: `{props: {key: value}, attrs: {key: value}}` optional set of properties and attributes to set on the component.
- `slotted`: optional, a `<DocumentFragment>`: the DOM to append to the document.

### Return value

- A *Jadis* component instance containing the defined slotted elements (children).

## Examples

:::code-group

```javascript
templateHtml() {
    return html`
      ${MyComponent.toTemplate({}, html`
          <h1 class="title">My Title</h1>
          <p class="content">My content</p>
      `)}
    `
}
```

```typescript
templateHtml(): DocumentFragment {
    return html`
      ${MyComponent.toTemplate({}, html`
          <h1 class="title">My Title</h1>
          <p class="content">My content</p>
      `)}
    `
}

```

:::

This will render:

```html
<my-component>
  <h1 class="title">My Title</h1>
  <p class="content">My content</p>
</my-component>
```

### With props and attributes

```javascript

${MyComponent.toTemplate(
  {
    attrs: {class: "container"}, 
    props: {titleValue: "My First Component"}
  }, html`
    <h1>My Title</h1>
    <p>My Paragraph</p>
  `
)}
  
```

This will render:

```html
<my-component class="container">
  <h1 class="title">My Title</h1>
  <p class="content">My content</p>
</my-component>
````
