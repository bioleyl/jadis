# 🔄 useChange Helper

The `useChange` helper provides a simple and reactive way to manage internal state inside Jadis components.
It creates a value container with `get` and `set` methods, and automatically calls a provided callback whenever the value changes.

This makes it ideal for updating the DOM, emitting events, or triggering logic whenever a piece of component state is modified.

## 📦 Signature
```
useChange(initialValue, onChange, options): Readonly<ChangeHandler<T>>
```

- `initialValue` — the starting value
- `onChange(newValue, oldValue)` — callback fired whenever set() updates the value
- `options.immediate` — whether the callback should run once immediately on component connect
- **returns** a `ChangeHandler<T>` with:
    - `.get(): T`
    - `.set(valueOrUpdater): void`

The returned object is **readonly** so consumers cannot replace the handler — only update its value using `.set()`.

## 👁️ How It Works

`useChange` wraps a value in a `ChangeHandler` object:

- Calling `.set()` updates the value
- `onChange` runs with (newValue, oldValue)
- If `immediate: true`, the callback is also triggered once when the component becomes connected, using the initial value

This gives you a reactive, lightweight state system without needing proxies, observers, or re-renders.

## 🧪 Example

Here’s a minimal example of using `useChange` to keep text inside an element in sync with a component state variable:

```typescript
class ToggleSwitch extends Jadis {
  private readonly _on = this.useChange(
    false,
    (value) => {
      this._refs.label.textContent = value ? 'ON' : 'OFF';
    },
    { immediate: true }
  );

  private readonly _refs = this.useRefs((ref) => ({
    label: ref('span'),
    button: ref('button'),
  }));

  templateHtml() {
    return html`
      <span></span>
      <button>Toggle</button>
    `;
  }

  onConnect() {
    this.on(this._refs.button, 'click', () => {
      this._on.set((v) => !v);
    });
  }
}
```

**What happens:**
- `_on` starts at `false`
- `immediate: true` makes the label update on first connection (`OFF`)
- Clicking the button toggles the value through `.set()`
- Each toggle triggers the `onChange` callback, updating the label

## ⚙️ Options
`immediate?: boolean`

When `true`, the `onChange` callback is triggered once using the initial value.

If the component is:
- **already connected** → runs immediately
- **not yet connected** → queued and runs in onConnect

Useful for setting initial DOM state without duplicating logic.

## 🧠 Typing Notes

The returned handler is fully typed:

```typescript
const count = this.useChange(0, (newVal: number) => { ... });
count.get(); // number
count.set(5); // ok
count.set((v) => v + 1); // also ok. "v" is the current value
```

No casts or generics are needed — TypeScript infers everything.

## 📌 Integration With Other Helpers

`useChange` works seamlessly with:
- `useRefs` (to update DOM nodes)
- `useEvents` (to emit change events)