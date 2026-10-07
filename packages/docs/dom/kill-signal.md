# killSignal

Every Jadis component provides a built-in `AbortSignal` called `killSignal`. It is automatically aborted when the component disconnects from the DOM, providing a reliable mechanism for cleaning up resources.

## Signature

```typescript
this.killSignal: AbortSignal;
```

## Usage

Pass `this.killSignal` to any `addEventListener` call or API that accepts an `AbortSignal`:

```typescript
onConnect(): void {
  this.getElement('button').addEventListener(
    'click',
    () => console.log('Clicked!'),
    { signal: this.killSignal }
  );
}
```

When the component is removed from the DOM, the signal aborts and all associated listeners are automatically removed.

## Where It Is Used Internally

| Helper | Cleanup Mechanism |
|---|---|
| `this.on()` | Uses `killSignal` internally — no manual handling needed |
| `useEvents()` | Registers listeners with `killSignal` |
| `onBus()` | Passes `killSignal` to the Bus's `register()` method |

## Manual Usage

`this.on()` also takes `window` and `document`. For anything else that outlives the component, a `fetch` or another event target, pass the signal yourself:

```typescript
onConnect(): void {
  fetch('/api/items', { signal: this.killSignal });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    console.log('Theme changed');
  }, { signal: this.killSignal });
}
```

## See Also

- [Event Handling](../state/event-handling.md) — Using `this.on()` for auto-cleaned listeners.
- [Lifecycle](../guides/lifecycle.md) — When `killSignal` is aborted.
