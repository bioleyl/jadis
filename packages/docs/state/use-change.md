# React to a property change with `useChange`

The `useChange` helper provides a small state container for managing values inside *Jadis* components. It calls your callback when the value changes; it does not automatically re-render the template.
It creates a value container with `get` and `set` methods, and automatically calls a provided callback whenever the value changes.

This makes it ideal for updating the DOM, emitting events, or triggering logic whenever a piece of component state is modified.

## Signature

```typescript
this.useChange<T>(
  initialValue: T,
  onChange: (newValue: T, oldValue: T) => void,
  options?: { immediate?: boolean; attribute?: string; parse?: (value: string | null) => T }
): Readonly<ChangeStateHandler<T>>
```

### Parameters

- `initialValue`: the starting value
- `onChange(newValue, oldValue)`: callback function fired whenever `set()` updates the value
- `options.immediate?`: `<boolean>`. When `true`, the `onChange` callback is triggered once using the initial value.
  Defines whether the callback should run once immediately once the component connects. If the component is:
  - **already connected** → runs immediately
  - **not yet connected** → queued and runs while the component connects, right after its template is rendered and before the browser paints (before `onConnect()`)

Useful for setting initial DOM state without duplicating logic.
- `options.attribute?`: `<string>`. Sets the value from this attribute, too; see [Bound to an attribute](#bound-to-an-attribute). It turns `immediate` on unless `immediate` is given.
- `options.parse?`: `(value: string | null) => T`. Turns the attribute's value, `null` when it is absent, into the field's value. Strings, numbers and booleans have a default one; any other type needs its own.

### Return value

- A `ChangeStateHandler<T>` object with 2 methods:
  - `.get(): T`
  - `.set(valueOrUpdater): void`

The returned object is **readonly** so consumers cannot replace the handler, only update its value using `.set()`.

## How It Works

`useChange` wraps a value in a `ChangeHandler` object:

- Calling `.set()` updates the value
- `onChange` runs with (newValue, oldValue)
- If `immediate: true`, the callback is also triggered once when the component becomes connected, using the initial value
- While the component is not connected, `.set()` stores the value and the callback waits. When the component connects, it runs **once**, with the current value and the value before the first change. Setting a value several times before connecting therefore costs one update, and the template is filled in before its first paint.
- Attributes are applied after those waiting changes, so an attribute set on the element wins over a property set before it was connected.
- Once the component is connected, every `.set()` calls the callback, even when the value does not change.

:::warning Replace values, do not change them in place
`oldValue` is the previous value itself, not a copy, so any value can be stored: arrays, objects holding functions, DOM nodes. An updater that changes the value in place and returns it (`set((list) => { list.push(item); return list; })`) gets the same object as `oldValue` and `newValue`: return a new value instead (`set((list) => [...list, item])`).

A function passed to `.set()` is called as an updater. To store a function, wrap it: `set(() => callback)`.
:::

This gives you a reactive, lightweight state system without needing proxies, observers, or re-renders.

## Example with an updater

Here’s a minimal example of using `useChange` to keep text inside an element in sync with a component state variable:

```tsx
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

  templateHtml(): Node {
    return (
      <>
        <span></span>
        <button>Toggle</button>
      </>
    );
  }

  onConnect() {
    this.on(this.refs.button, 'click', () => {
      this.toggleValue.set((v) => !v);
    });
  }
}
```

## Example with a value

```tsx
import { Jadis } from "@jadis/core";

export class Dice extends Jadis {
  static readonly selector = 'dice-roller';
  private readonly rolled = this.useChange(
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

  templateHtml(): Node {
    return (
      <>
        <span></span>
        <button>Roll</button>
      </>
    );
  }

  onConnect(): void {
    this.on(this.refs.button, 'click', () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      this.rolled.set(roll);
    })
  }
}

Dice.register();
```

## Bound to an attribute

A field that can also be written in HTML names its attribute. The attribute sets the field through `.set()`, so the callback runs as for a property, and the attribute is applied while the component connects, before the first paint:

```tsx
class ProgressBar extends Jadis {
  static readonly selector = 'progress-bar';

  readonly label = this.useChange('', (value) => {
    this.refs.label.textContent = value;
  }, { attribute: 'label' });
  readonly value = this.useChange(0, (value) => {
    this.refs.bar.style.width = `${value}%`;
  }, { attribute: 'value' });
  readonly striped = this.useChange(false, (value) => {
    this.toggleClass('striped', value);
  }, { attribute: 'striped' });
  readonly tone = this.useChange<Tone>('neutral', (value) => {
    this.refs.bar.dataset.tone = value;
  }, { attribute: 'tone', parse: (value) => TONES.find((tone) => tone === value) ?? 'neutral' });

  // …
}
```

```html
<progress-bar label="Upload" value="40" striped tone="ok"></progress-bar>
```

The default parsers, chosen from the initial value:

| Initial value | Attribute present | Attribute absent |
|---|---|---|
| string | its text | the initial value |
| number | its number; the initial value when blank or not a number | the initial value |
| boolean | `true`, whatever its text, as for `disabled` | `false` |

Anything else, a union of strings or a nullable value, needs `parse`: TypeScript asks for it.

The field does not write the attribute back: setting `.label` leaves `label=""` alone. A callback that does write it (to style `:host([tone])`, for instance) must skip a value the attribute already has: even an unchanged `setAttribute` is a change to the observer, which would call the field back without end.

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

- `useRefs` (to update DOM nodes), see the documentation about it [on its dedicated page](../dom/use-refs.md).
- `useEvents` (to emit change events), see the documentation about it [on the child to parent communication page](../communication/child-to-parent.md).
  