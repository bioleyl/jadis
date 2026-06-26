# useRefs()

The `useRefs()` method creates typed, lazy references to multiple elements within your component's template. It is a convenient alternative to calling `getElement()` repeatedly.

## Signature

```typescript
this.useRefs<T extends Record<string, HTMLElement>>(
  mapFn: (ref: (query: string) => HTMLElement) => T
): Readonly<T>;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `mapFn` | `Function` | A function that receives a `ref()` helper and returns an object mapping names to selectors |

### Return Value

A frozen object where each key is a lazy getter returning the corresponding `HTMLElement`.

## Basic Example

```typescript
import { Jadis, html, createSelector } from '@jadis/core';

class FormComponent extends Jadis {
  static selector = createSelector('form-component');

  readonly refs = this.useRefs((ref) => ({
    input: ref<HTMLInputElement>('input'),
    submitButton: ref<HTMLButtonElement>('button'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <input type="text" />
      <button>Submit</button>
    `;
  }

  onConnect(): void {
    this.refs.input.focus();
  }
}
```

## How It Works

`useRefs()` captures the selector strings at definition time via a dummy call, then creates lazy getters that call `getElement()` when each reference is first accessed. The result is frozen for safety.

## Cross-Shadow References

The `ref()` helper supports the `>>>` combinator for accessing elements inside child components:

```typescript
readonly refs = this.useRefs((ref) => ({
  childButton: ref('child-component >>> button'),
}));
```

## TypeScript Usage

Specify generic types on `ref()` for precise typing:

```typescript
readonly refs = this.useRefs((ref) => ({
  input: ref<HTMLInputElement>('input.my-input'),
  button: ref<HTMLButtonElement>('button'),
}));
```

## JSDoc Usage

For JavaScript projects, use JSDoc comments:

```javascript
/** @type {HTMLInputElement} */
const refs = this.useRefs((ref) => ({
  input: ref('input.my-input'),
  button: ref('button'),
}));
```

## Best Practices

- Define all refs in a single `useRefs()` call for clarity.
- Use descriptive names (`submitButton` instead of `btn`).
- Refs are lazy — the element is not queried until first access.

## See Also

- [getElement()](./get-element.md) — The underlying element lookup method.
