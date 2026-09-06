# Lifecycle

Every Jadis component follows the [Custom Elements lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#customization_reference). Jadis exposes the most important hooks as protected methods you can override.

## Lifecycle Hooks

### `onConnect()`

Called after the component is connected and its template has been rendered. This is the place to set up event listeners, fetch data, or perform connection-specific setup. It runs again if the component reconnects.

```typescript
class MyComponent extends Jadis {
  onConnect(): void {
    // Component is now in the DOM — safe to interact with it
    console.log('Component connected');
  }
}
```

### `onDisconnect()`

Called when the component is removed from the DOM. Use this for cleanup that is not tied to `killSignal`, such as canceling timers or stopping external work. Listeners registered through Jadis helpers are cleaned up automatically.

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
Constructor → render template → connectedCallback → onConnect → ... → disconnectedCallback → onDisconnect
```

1. **Constructor** — Runs when the class is instantiated. Shadow DOM is attached here if `useShadowDom` is `true`.
2. **Render** — `templateHtml()` and `templateCss()` run on the first connection, before `onConnect()`; the rendered DOM is reused on reconnection.
3. **`onConnect()`** — Runs asynchronously after the component is connected. It runs again after each reconnection.
4. **Active** — The component is in the DOM and responding to user interaction.
5. **`onDisconnect()`** — Runs when the component is removed. The internal `killSignal` is aborted first, cleaning up all registered listeners.

## Important Notes

- Templates render only on the first connection; reconnection reuses the existing DOM.
- `onConnect()` runs on a later task, not synchronously inside `appendChild()`.
- The `killSignal` is automatically aborted on disconnect, canceling listeners registered via `this.on()`, `useEvents()`, and `onBus()`.
- Avoid heavy work in the constructor. Defer connection-specific work to `onConnect()`.

## See Also

- [First Component](./first-component.md) — A practical example using lifecycle hooks.
- [Event Handling](../state/event-handling.md) — Using `this.on()` for auto-cleaned event listeners.
- [killSignal](../dom/kill-signal.md) — The built-in cleanup signal.
