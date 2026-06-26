# useEvents()

The `useEvents()` helper creates a type-safe event emitter for your component. It provides `register()` and `emit()` methods for defining and dispatching custom events, with automatic cleanup on disconnect.

## Signature

```typescript
this.useEvents<TEvents extends Record<string, unknown>>(): Readonly<UseEventsHandler<TEvents>>;
```

### Parameters

None (TypeScript) or an optional schema object (JavaScript).

### Return Value

A frozen object with two methods:

| Method | Description |
|---|---|
| `register(eventName, callback)` | Attach a listener for the named event |
| `emit(eventName, detail?)` | Dispatch a custom event with optional detail |

## TypeScript Usage

Define event types inline using a type parameter:

```typescript
class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  private readonly events = this.useEvents<{
    changed: string;
    clicked: { x: number; y: number };
  }>();

  templateHtml(): DocumentFragment {
    return html`<button>Click</button>`;
  }

  onConnect(): void {
    // Register a listener (can be on self or another component)
    this.events.register('changed', (value) => {
      console.log('Changed to:', value);
    });

    this.on(this.getElement('button'), 'click', () => {
      this.events.emit('clicked', { x: 10, y: 20 });
      this.events.emit('changed', 'new value');
    });
  }
}
```

## JavaScript Usage (JSDoc)

In plain JavaScript, pass a schema object to define event types:

```javascript
// @ts-check
class MyComponent extends Jadis {
  static selector = createSelector('my-component');

  events = this.useEvents({
    changed: String,
    clicked: Object,
  });

  onConnect() {
    this.events.register('changed', (value) => {
      console.log('Changed to:', value);
    });

    this.events.emit('changed', 'hello');
  }
}
```

## Emission

Events are dispatched as `CustomEvent` objects. The `detail` property contains the data you pass to `emit()`:

```typescript
this.events.emit('dataLoaded', { items: [1, 2, 3] });
```

Listeners receive the detail:

```typescript
this.events.register('dataLoaded', (detail) => {
  console.log(detail.items); // [1, 2, 3]
});
```

## Automatic Cleanup

Like all Jadis event mechanisms, `useEvents()` listeners are bound to the component's `killSignal` and are automatically removed when the component disconnects.

## Best Practices

- Use `useEvents()` for component-specific custom events.
- Use the [Bus](../api/bus-class.md) for cross-component or global event communication.
- Define event types explicitly for full type safety.

## See Also

- [Event Handling](./event-handling.md) — DOM event listeners with `this.on()`.
- [Cross-Component Communication](../communication/cross-components.md) — Using the Bus.
