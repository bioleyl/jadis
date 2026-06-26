# useChange()

The `useChange()` helper provides a lightweight reactive state mechanism. It creates a value container with `get()` and `set()` methods, and invokes a callback whenever the value changes.

## Signature

```typescript
this.useChange<T>(
  initialValue: T,
  onChange: (newValue: T, oldValue: T) => void,
  options?: ChangeOptions
): Readonly<UseChangeHandler<T>>;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `initialValue` | `T` | The starting value |
| `onChange` | `Function` | Callback invoked on every change with `(newValue, oldValue)` |
| `options.immediate` | `boolean` | If `true`, triggers `onChange` once on connection using the initial value |

### Return Value

A readonly `UseChangeHandler<T>` object:

```typescript
interface UseChangeHandler<T> {
  get(): T;
  set(value: T | ((prev: T) => T)): void;
}
```

## Basic Example

```typescript
class Counter extends Jadis {
  static readonly selector = 'counter';

  private readonly count = this.useChange(0, (val) => {
    this.refs.display.textContent = val.toString();
  });

  readonly refs = this.useRefs((ref) => ({
    display: ref('span'),
    button: ref('button'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect(): void {
    this.on(this.refs.button, 'click', () =>
      this.count.set((v) => v + 1)
    );
  }
}
```

## Immediate Mode

When `immediate: true`, the `onChange` callback fires once when the component connects, using the initial value. This avoids duplicating initialization logic:

```typescript
private readonly count = this.useChange(0, (val) => {
  this.refs.display.textContent = val.toString();
}, { immediate: true });
```

## Updater Functions

`set()` accepts either a direct value or an updater function:

```typescript
// Direct value
this.count.set(42);

// Updater function
this.count.set((prev) => prev + 1);
```

## Type Inference

TypeScript infers the type from `initialValue` automatically:

```typescript
const count = this.useChange(0, (newVal) => { ... });
count.get(); // number
count.set(5); // OK
count.set((v) => v + 1); // OK — "v" is inferred as number
```

## Best Practices

- Use `useChange()` for internal component state that drives DOM updates.
- Combine with `useRefs()` to sync state changes with DOM elements.
- Avoid using it for global or cross-component state — use the [Bus](../api/bus-class.md) instead.

## See Also

- [Event Handling](./event-handling.md) — Managing DOM events.
- [useEvents()](./use-events.md) — Custom event emission.
