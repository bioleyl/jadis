# Lifecycle

Every Jadis component follows the [Custom Elements lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#customization_reference). Jadis exposes the most important hooks as protected methods you can override.

## Lifecycle Hooks

### `onConnect()`

Called when the component is inserted into the DOM. This is the primary place to initialize your component: set up event listeners, fetch data, or perform one-time setup.

```typescript
class MyComponent extends Jadis {
  onConnect(): void {
    // Component is now in the DOM — safe to interact with it
    console.log('Component connected');
  }
}
```

### `onDisconnect()`

Called when the component is removed from the DOM. Use this for cleanup: cancel timers, remove global event listeners, or abort ongoing requests.

```typescript
class MyComponent extends Jadis {
  private _intervalId?: number;

  onConnect(): void {
    this._intervalId = setInterval(() => {
      console.log('ticking...');
    }, 1000);
  }

  onDisconnect(): void {
    clearInterval(this._intervalId);
    console.log('Component disconnected');
  }
}
```

## Connection State

You can check whether a component is currently connected to the DOM using the `isConnected` getter:

```typescript
class MyComponent extends Jadis {
  onConnect(): void {
    if (this.isConnected) {
      // Safe to interact with the DOM
    }
  }
}
```

## Lifecycle Timeline

```
Constructor → connectedCallback(onConnect) → ... → disconnectedCallback(onDisconnect)
```

1. **Constructor** — Runs when the class is instantiated. Shadow DOM is attached here if `useShadowDom` is `true`.
2. **`onConnect()`** — Runs after the component is appended to the document. Templates are rendered before this hook fires.
3. **Active** — The component is in the DOM and responding to user interaction.
4. **`onDisconnect()`** — Runs when the component is removed. The internal `killSignal` is aborted, cleaning up all registered listeners.

## Important Notes

- Templates (`templateHtml()` / `templateCss()`) are rendered **before** `onConnect()` is called.
- The `killSignal` is automatically aborted on disconnect, canceling all event listeners registered via `this.on()` and `useEvents()`.
- Avoid heavy work in the constructor. Defer initialization to `onConnect()`.

## See Also

- [First Component](./first-component.md) — A practical example using lifecycle hooks.
- [Event Handling](../state/event-handling.md) — Using `this.on()` for auto-cleaned event listeners.
- [killSignal](../dom/kill-signal.md) — The built-in cleanup signal.
