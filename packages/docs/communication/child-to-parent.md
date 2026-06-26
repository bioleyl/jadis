# Child to Parent

A child component communicates upward to its parent using `useEvents()`. The child exposes its events publicly, and the parent registers listeners via `.register()` — which automatically handles cleanup when either component disconnects.

## Pattern

1. **Child** — Use `useEvents()` to emit an event with relevant data.
2. **Parent** — Listen for the event on the child element and handle the detail.

## Child Component

```typescript
import { Jadis, html } from '@jadis/core';

class Counter extends Jadis {
  static readonly selector = 'counter';

  private readonly count = this.useChange(0, (newValue) => {
    this.countEvents.emit('change', newValue);
  });

  readonly countEvents = this.useEvents<{ change: number }>();

  templateHtml(): DocumentFragment {
    return html`<button>Increment</button>`;
  }

  onConnect(): void {
    this.on(this.getElement('button'), 'click', () =>
      this.count.set((v) => v + 1)
    );
  }
}

Counter.register();
```

## Parent Component

```typescript
import { Jadis, html } from '@jadis/core';

class Dashboard extends Jadis {
  static readonly selector = 'dashboard';

  private counterValue = 0;

  readonly refs = this.useRefs((ref) => ({
    counter: ref('counter'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <counter></counter>
      <p>Value: <span id="display"></span></p>
    `;
  }

  onConnect(): void {
    this.refs.counter.countEvents.register('change', (detail) => {
      this.counterValue = detail;
      this.getElement('#display').textContent = this.counterValue.toString();
    });
  }
}

Dashboard.register();
```

## Best Practices

- Use descriptive event names (e.g., `'change'`, `'submit'`, `'select'`).
- Expose events as `readonly` on the child so parents can call `.register()` for automatic cleanup.
- For more complex scenarios, consider the [Bus](../api/bus-class.md) for decoupled communication.

## See Also

- [Parent to Child](./parent-to-child.md) — The reverse direction.
- [useEvents()](../state/use-events.md) — A type-safe event emitter alternative.
