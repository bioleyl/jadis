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

For event listeners outside of Jadis helpers (e.g., on `window` or `document`):

```typescript
onConnect(): void {
  window.addEventListener('resize', () => {
    console.log('Resized');
  }, { signal: this.killSignal });
}
```

## See Also

- [Event Handling](../state/event-handling.md) — Using `this.on()` for auto-cleaned listeners.
- [Lifecycle](../guides/lifecycle.md) — When `killSignal` is aborted.
