# createElement()

Creates an HTML element with optional properties, attributes, and automatic DOM attachment.

## Signature

```typescript
createElement<T extends HTMLElement>(
  tag: string | JadisConstructor,
  options?: OptionsWithProps<ElementValues<T>>,
  appendTo?: AppendableElement
): T;
```

### Overloads

| Signature | Return Type |
|---|---|
| `createElement(tag, options?, appendTo?)` where `tag` is a standard HTML tag | The corresponding `HTMLElement` subtype (`HTMLDivElement`, `HTMLButtonElement`, etc.) |
| `createElement<T>(tag, options?, appendTo?)` where `tag` is a string | `T` (generic) |
| `createElement(component, options?, appendTo?)` where `tag` is a Jadis constructor | Instance of the component |

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `tag` | `string \| JadisConstructor` | The element tag name or component class |
| `options` | `OptionsWithProps` | `{ props?: {...}, attrs?: {...} }` — Properties and attributes to set |
| `appendTo` | `HTMLElement \| ShadowRoot \| DocumentFragment` | Optional parent to append the created element to |

### Return Value

The created `HTMLElement` (or component instance).

## Options Object

```typescript
{
  props?: Record<string, unknown>;  // Set as properties on the element
  attrs?: Record<string, unknown>;  // Set as attributes (auto-kebab-cased)
}
```

- **`props`** — Sets JavaScript properties directly on the element. `ChangeHandler` instances are updated via `.set()` rather than reassigned.
- **`attrs`** — Sets HTML attributes. Keys are automatically converted to kebab-case.

## Examples

### Basic Element

```typescript
import { createElement } from '@jadis/core';

const div = createElement('div', { attrs: { class: 'container' } });
// → <div class="container"></div>
```

### With Properties and Attributes

```typescript
const container = createElement('div', { attrs: { class: 'container' } });

createElement('h1', { props: { textContent: 'My Title' } }, container);

createElement(
  'p',
  {
    attrs: { 'data-test': 'test' },
    props: { textContent: 'Hello World' }
  },
  container
);
```

Result:

```html
<div class="container">
  <h1>My Title</h1>
  <p data-test="test">Hello World</p>
</div>
```

### With Custom Components

```typescript
import { Jadis, createSelector, createElement } from '@jadis/core';

class MyButton extends Jadis {
  static readonly selector = 'my-button';
}

const btn = createElement(MyButton, {
  props: { label: 'Click me' },
  attrs: { theme: 'primary' },
}, document.body);
```

### Type Inference

```typescript
const input = createElement('input');
// input is HTMLInputElement

const div = createElement('div');
// div is HTMLDivElement
```

For custom elements, specify the type explicitly:

```typescript
const btn = createElement<MyButton>('my-button');
```

## See Also

- [toTemplate()](../templating/to-template.md) — Component-specific element creation.
