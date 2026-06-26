# Event Handling

Jadis provides the `this.on()` method for registering DOM event listeners with automatic cleanup. When the component disconnects, all listeners registered via `this.on()` are automatically removed.

## Signature

```typescript
this.on<Element extends HTMLElement, EventName extends keyof HTMLElementEventMap>(
  element: Element,
  eventName: EventName,
  callback: (event: HTMLElementEventMap[EventName]) => void
): void;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `element` | `HTMLElement` | The element to attach the listener to |
| `eventName` | `string` | The event name (e.g., `'click'`, `'input'`, `'submit'`) |
| `callback` | `Function` | The handler function, typed with the appropriate event type |

### Return Value

`void`

## Basic Example

```typescript
class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  templateHtml(): DocumentFragment {
    return html`<button>Click me</button>`;
  }

  onConnect(): void {
    this.on(this.getElement('button'), 'click', (event) => {
      console.log('Button clicked!', event);
    });
  }
}
```

## Multiple Events

Register listeners for different elements and events independently:

```typescript
onConnect(): void {
  this.on(this.refs.input, 'input', (e) => {
    console.log('Input value:', (e.target as HTMLInputElement).value);
  });

  this.on(this.refs.form, 'submit', (e) => {
    e.preventDefault();
    console.log('Form submitted');
  });
}
```

## How Cleanup Works

`this.on()` uses the [killSignal](../dom/kill-signal.md) internally. When the component disconnects, the `AbortController` signals all registered listeners to stop, and the browser removes them automatically.

## Direct addEventListener Alternative

For cases where `this.on()` is not suitable (e.g., non-HTMLElement targets), you can use `addEventListener` directly with the `killSignal`:

```typescript
onConnect(): void {
  window.addEventListener('resize', () => {
    console.log('Window resized');
  }, { signal: this.killSignal });
}
```

## Best Practices

- Prefer `this.on()` for HTMLElement events — it is simpler and auto-cleans.
- Use `this.killSignal` with direct `addEventListener` calls for non-element targets (e.g., `window`, `document`).
- Always register listeners in `onConnect()`, never in the constructor.

## See Also

- [killSignal](../dom/kill-signal.md) — The built-in cleanup signal.
- [useEvents()](./use-events.md) — Custom event emission.
