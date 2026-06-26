# getElement()

The `getElement()` method retrieves an element from the component's template using a CSS selector. It is the fundamental way to access DOM nodes within your component.

## Signature

```typescript
this.getElement<T extends HTMLElement = HTMLElement>(query: string): T;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | A CSS selector string |

### Return Value

The matching `HTMLElement`, cast to the specified generic type.

### Throws

Throws an error if no element matches the selector.

## Basic Usage

```typescript
class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  templateHtml(): DocumentFragment {
    return html`<button>Click me</button>`;
  }

  onConnect(): void {
    const button = this.getElement('button');
    button.addEventListener('click', () => {
      console.log('Clicked!');
    });
  }
}
```

## Type Inference

When you pass an HTML tag name as the selector, the return type is automatically inferred:

```typescript
const button = this.getElement('button');   // HTMLButtonElement
const input = this.getElement('input');     // HTMLInputElement
const div = this.getElement('div');         // HTMLDivElement
```

For custom selectors, specify the type explicitly:

```typescript
const myDiv = this.getElement<HTMLDivElement>('.my-class');
```

## Crossing Shadow Boundaries

Use the `>>>` combinator to access elements inside a child component's shadow DOM:

```typescript
// Access a button inside child-component's shadow root
const innerButton = this.getElement('child-component >>> button');
```

Chaining is supported:

```typescript
// Deep traversal through multiple shadow boundaries
const target = this.getElement('parent >>> child >>> .deep-element');
```

## Best Practices

- Prefer `useRefs()` when you need multiple element references — it is more concise.
- Use `>>>` sparingly; direct access to a child's internals breaks encapsulation.
- Always call `getElement()` after the template has been rendered (i.e., in or after `onConnect()`).

## See Also

- [useRefs()](./use-refs.md) — Batch element reference creation.
- [Shadow DOM](../guides/shadow-dom.md) — Understanding shadow boundaries.
