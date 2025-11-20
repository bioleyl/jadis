# React to a property change with `useChange`

The `useChange` helper provides a simple and reactive way to manage internal state inside *Jadis* components.
It creates a value container with `get` and `set` methods, and automatically calls a provided callback whenever the value changes.

This makes it ideal for updating the DOM, emitting events, or triggering logic whenever a piece of component state is modified.

## Signature

```typescript
this.useChange(<initialValue>, <onChange>, <options>): Readonly<ChangeHandler<T>>
```

### Parameters

- `initialValue`: the starting value
- `onChange(newValue, oldValue)`: callback function fired whenever `set()` updates the value
- `options.immediate?`: `<boolean>`. When `true`, the `onChange` callback is triggered once using the initial value.
  Defines whether the callback should run once immediately once the component connects. If the component is:
  - **already connected** → runs immediately
  - **not yet connected** → queued and runs in onConnect

Useful for setting initial DOM state without duplicating logic.

### Return value

- A `ChangeHandler<T>` object with 2 methods:
  - `.get(): T`
  - `.set(valueOrUpdater): void`

The returned object is **readonly** so consumers cannot replace the handler, only update its value using `.set()`.

## How It Works

`useChange` wraps a value in a `ChangeHandler` object:

- Calling `.set()` updates the value
- `onChange` runs with (newValue, oldValue)
- If `immediate: true`, the callback is also triggered once when the component becomes connected, using the initial value

This gives you a reactive, lightweight state system without needing proxies, observers, or re-renders.

## Example with an updater

Here’s a minimal example of using `useChange` to keep text inside an element in sync with a component state variable:

```typescript
class ToggleSwitch extends Jadis {
  private readonly toggleValue = this.useChange(
    false,
    (value) => {
      this.refs.label.textContent = value ? 'ON' : 'OFF';
    },
    { immediate: true }
  );

  private readonly refs = this.useRefs((ref) => ({
    label: ref<HTMLSpanElement>('span'),
    button: ref<HTMLButtonElement>('button'),
  }));

  templateHtml() {
    return html`
      <span></span>
      <button>Toggle</button>
    `;
  }

  onConnect() {
    this.on(this.refs.button, 'click', () => {
      this.toggleValue.set((v) => !v);
    });
  }
}
```

## Example with a value

```typescript
import { Jadis, html } from "@jadis/core";

export class Dice extends Jadis {
  static readonly selector = 'toggle-value';
  private readonly toggleValue = this.useChange(
    0,
    (value) => {
      this.refs.label.textContent = value.toString();
    },
    { immediate: true }
  );

  private readonly refs = this.useRefs((ref) => ({
    label: ref<HTMLSpanElement>('span'),
    button: ref<HTMLButtonElement>('button')
  }));

  templateHtml(): DocumentFragment {
    return html`
      <span></span>
      <button>Roll</button>
    `
  }

  onConnect(): void {
    this.on(this.refs.button, 'click', () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      this.toggleValue.set(roll);
    })
  }
}

Dice.register();
```

## Typing Notes

The returned handler is fully typed:

```typescript
const count = this.useChange(0, (newVal: number) => { ... });
count.get(); // number
count.set(5); // ok
count.set((v) => v + 1); // also ok. "v" is the current value
```

No casts or generics are needed: TypeScript infers everything.

## Integration With Other Helpers

`useChange` works seamlessly with:

- `useRefs` (to update DOM nodes), see the documentation about it [on its dedicated page](../templating/use-refs.md).
- `useEvents` (to emit change events), see the documentation about it [on the child to parent communication page](../communication/child-to-parent.md).
  