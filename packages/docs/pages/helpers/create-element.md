# `createElement` helper

The `createElement` helper is designed to simplify DOM construction in JavaScript and TypeScript.
It lets you create HTML elements, set properties and attributes, and optionally append the new element to a container, all with minimal boilerplate.

## Signature

```typescript
createElement(<tag>, <options>, <appendTo>): <HTMLElement>
```

### Parameters

- `tag`: HTML element tag name of the element to create.
- `options`: optional, OptionsWithProps object. It is a set of properties and attributes to set on the component `{attrs: {}, props: {}}`

```javascript
{
  props?: { ... }   // Assigns properties to the element
  attrs?: { ... }   // Assigns HTML attributes (auto-kebab-cased)
}
```

`props`: set JavaScript properties directly on the element  
`attrs`: set HTML attributes (converted to kebab-case automatically)  

:::info
`ChangeHandler` instances in props are updated via `.set()` instead of reassigned
:::  

- `appendTo`: Append target, optional. Can be `HTMLElement`, `ShadowRoot`, `DocumentFragment`. If provided, the created element will be appended automatically.

### Return value

- The created HTML element: matches the tag name. For example:
  - `'div'` returns an `HTMLDivElement`
  - `'p'` returns an `HTMLParagraphElement`
  - `'button'` returns an `HTMLButtonElement`
  - `'input'` returns an `HTMLInputElement`
  - …and all other standard HTML elements.

This ensures proper typing and autocomplete when using `TypeScript` or `@ts-check`.

## Example

```javascript
import { createElement } from '@jadis/core';

const container = createElement('div', { attrs: { class: 'container' } });

createElement('h1', { props: { textContent: 'My Title' } }, container);

createElement(
  'p',
  {
    attrs: { 'data-test': 'test' },
    props: { textContent: 'This is a paragraph' }
  },
  container
);

Array.from({ length: 3 }, (_, i) => {
  createElement('div', { props: { textContent: `Item ${i + 1}` } }, container);
});
```

This will render:

```html
<div class="container">
  <h1>My Title</h1>
  <p data-test="test">This is a paragraph.</p>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Note About Typing

The `createElement` helper automatically infers the element type from the tag name.

```javascript
const el = createElement('input');
// el is inferred as HTMLInputElement
```

When dealing with **custom elements**, you can manually specify the return type to ensure full autocomplete support:

```typescript
createElement<MyCustomComponent>('my-custom-component');
```

This ensures the returned element is recognized as `MyCustomComponent` instead of a generic `HTMLElement`.
