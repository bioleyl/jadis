# useEvents()

The `useEvents()` helper creates a type-safe event emitter for your component. It provides `register()` and `emit()` methods for defining and dispatching custom events, with automatic cleanup on disconnect.

## Signature

```typescript
this.useEvents<TEvents extends Record<string, unknown>>(): Readonly<UseEventsHandler<TEvents>>;
```

### Parameters

None in TypeScript, or an optional schema object in JavaScript.

### Return value

A frozen object with `register(eventName, callback)` and `emit(eventName, detail?)` methods.

## TypeScript usage

```tsx
import { Jadis } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  private readonly events = this.useEvents<{
    changed: string;
    clicked: { x: number; y: number };
  }>();

  templateHtml(): Node {
    return <button type="button">Click</button>;
  }

  onConnect(): void {
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

## JavaScript usage

```js
// @ts-check
import { createSelector, Jadis } from '@jadis/core';

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

MyComponent.register();
```

## Emission

Events are dispatched as `CustomEvent` objects on the component itself. They do not bubble and do not cross shadow roots: only listeners registered on that component receive them. The callback receives the `detail` (the data passed to `emit()`) directly:

```typescript
this.events.emit('dataLoaded', { items: [1, 2, 3] });
this.events.register('dataLoaded', (detail) => {
  console.log(detail.items);
});
```

## Automatic cleanup

`useEvents()` listeners are bound to the `killSignal` of the component that emits the events, and are removed when it disconnects. A parent listening to a child registers in its own `onConnect()`, so the listener is added again after each reconnection.

## Best practices

- Use `useEvents()` for component-specific custom events.
- Use the [Bus](../api/bus-class.md) for cross-component or global event communication.
- Define event types explicitly for full type safety.

## See also

- [Event Handling](./event-handling.md) — DOM event listeners with `this.on()`.
- [Cross-Component Communication](../communication/cross-components.md) — Using the Bus.
