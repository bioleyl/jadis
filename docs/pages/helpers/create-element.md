# 🛠️ `createElement` helper

The `createElement` helper was built to simplify DOM construction using JavaScript. It allows you to create and insert HTML elements with minimal boilerplate.

## 📦 Signature

```typescript
createElement(<tag>, <attributes>, <parent>): <HTMLElement>
```

The return type matches the tag name. For example:

- `'div'` returns an `HTMLDivElement`
- `'p'` returns an `HTMLParagraphElement`
- `'button'` returns an `HTMLButtonElement`
- `'input'` returns an `HTMLInputElement`

and so on...

This means you get correct types and autocomplete when working in `TypeScript` or with `@ts-check` in JavaScript.

## 🧪 Example

```javascript
import { createElement } from '@jadis/core';

const container = createElement('div', { class: 'container' });
createElement('h1', {}, container).textContent = 'My Title';
createElement('p', { dataTest: 'test' }, container).textContent =
  'This is a paragraph.';
Array.from({ length: 3 }, (_, i) => {
  createElement('div', {}, container).textContent = `Item ${i + 1}`;
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

## 🧭 Usage in Jadis Components

Every Jadis component includes a static `createElement` method with the same signature as the global `createElement` helper — except the tag name is automatically set to the component’s registered selector.

This makes it easy to instantiate components programmatically with attributes and a parent container.

```javascript
import { createElement } from '@jadis/core';

class MyComponent extends Jadis {
  static selector = 'my-component';
  static template = html`<h1>My Title</h1>`;
}

MyComponent.register();

const container = createElement('div', { class: 'container' });
const component = MyComponent.createElement({ theme: 'dark' }, container);
createElement('h1', {}, component).textContent = 'My Title';
```

This will render:

```html
<div class="container">
  <my-component theme="dark">
    <h1>My Title</h1>
  </my-component>
</div>
```

## 🧠 Note About Typing

The `createElement` helper automatically infers the return type based on the tag name — for example, `'div'` will return an `HTMLDivElement`.

When using **custom components**, you can manually specify the return type to ensure correct typing and autocomplete support.

::: code-group

```typescript
createElement<MyCustomComponent>('my-custom-component');
```

```javascript [js-doc]
/** @type {MyCustomComponent} */
createElement('my-custom-component');
```

:::

This ensures that your returned element is recognized as a `MyCustomComponent` rather than a generic `HTMLElement`.
