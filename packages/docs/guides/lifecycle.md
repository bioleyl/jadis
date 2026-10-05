# Lifecycle

Every Jadis component follows the [Custom Elements lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#customization_reference). Jadis exposes the most important hooks as protected methods you can override.

## Lifecycle Hooks

### `onConnect()`

Called on the task after the component is connected, once its template has been rendered. This is the place to set up event listeners, fetch data, or perform connection-specific setup. It runs again each time the component reconnects (moving it in the DOM counts), on the same DOM: make it safe to repeat, and guard one-time work (filling a list, a first fetch) by what the DOM already holds.

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
    this._intervalId = window.setInterval(() => {
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

You can check whether a component is currently connected to the DOM using the `isConnected` getter. It matters after an `await`: the component may have been removed meanwhile. Pass `killSignal` to `fetch`, so a removed component stops waiting:

```tsx
class ItemList extends Jadis {
  static readonly selector = 'item-list';

  templateHtml(): Node {
    return <ul></ul>;
  }

  async onConnect(): Promise<void> {
    const response = await fetch('/api/items', { signal: this.killSignal });
    const items: string[] = await response.json();
    if (!this.isConnected) {
      return;
    }
    this.getElement('ul').replaceChildren(...items.map((item) => <li>{item}</li>));
  }
}
```

## Lifecycle Timeline

```
Constructor → connectedCallback (render template) → onConnect → ... → disconnectedCallback → onDisconnect
```

1. **Constructor** — Runs when the class is instantiated. Shadow DOM is attached here if `useShadowDom` is `true`.
2. **`connectedCallback()`** — Runs when the component is connected. On the first connection it renders `templateHtml()` and `templateCss()`; the rendered DOM is reused on reconnection. It then applies the `useChange` values set before the connection, then the attribute callbacks, all synchronously, before scheduling `onConnect()`.
3. **`onConnect()`** — Runs asynchronously after the component is connected. It runs again after each reconnection.
4. **Active** — The component is in the DOM and responding to user interaction.
5. **`disconnectedCallback()` / `onDisconnect()`** — The callback aborts `killSignal` and then calls `onDisconnect()` when the component is removed.

## Important Notes

- Templates render only on the first connection; reconnection reuses the existing DOM.
- `onConnect()` runs on a later task, not synchronously inside `appendChild()`. The template and the values set before the connection are already in place when `appendChild()` returns.
- The `killSignal` is automatically aborted on disconnect, canceling listeners registered via `this.on()`, `useEvents()`, and `onBus()`.
- Avoid heavy work in the constructor. Defer connection-specific work to `onConnect()`.

## See Also

- [First Component](./first-component.md) — A practical example using lifecycle hooks.
- [Event Handling](../state/event-handling.md) — Using `this.on()` for auto-cleaned event listeners.
- [killSignal](../dom/kill-signal.md) — The built-in cleanup signal.
