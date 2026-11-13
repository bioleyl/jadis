# useEvents()

The `useEvents()` helper creates a type-safe event emitter for your component. It provides `register()` and `emit()` methods for defining and dispatching custom events, with automatic cleanup on disconnect.

## Signature

```typescript
this.useEvents<TEvents extends Record<string, unknown>>(): Readonly<UseEventsHandler<TEvents>>;
```

### Parameters

None in TypeScript, or an optional schema object in JavaScript.

### Return value

A frozen object with `register(eventName, callback)` and `emit(eventName, detail?)` methods. `emit` returns `false` when a listener cancelled the event, `true` otherwise.

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

Events are dispatched as `CustomEvent` objects on the component itself. They do not bubble and do not cross shadow roots: only listeners registered on that component receive them. The callback receives the `detail` (the data passed to `emit()`) directly, then the event itself:

```typescript
this.events.emit('dataLoaded', { items: [1, 2, 3] });
this.events.register('dataLoaded', (detail) => {
  console.log(detail.items);
});
```

## Cancelling an event

The event is the callback's second argument. A listener that calls `event.preventDefault()` cancels it, and `emit()` then returns `false`: a component that emits **before** it acts lets its parent refuse what it was about to do.

```typescript
// In the component: ask first, act unless a listener refused.
private close(): void {
  if (!this.events.emit('close', this.reason)) {
    return;
  }
  this.hide();
}

// In the parent
panel.events.register('close', (reason, event) => {
  if (this.hasUnsavedChanges()) {
    event.preventDefault();
  }
});
```

An event nobody cancels changes nothing: `emit()` returns `true`, as it does when nobody listens.

## Its own events only

A callback hears the events the component emitted itself. An event of the same name that **bubbles up from an element slotted into the component** is not one: a tab bar whose own event is `change` does not call back for the native `change` of a `<select>` in one of its panels. To hear those, listen to the element itself, or to the component with `this.on(component, 'change', …)`, which gives every event of that name as the DOM does.

## Automatic cleanup

`useEvents()` listeners are bound to the `killSignal` of the component that emits the events, and are removed when it disconnects; a move is not a disconnection. A parent listening to a child registers in its own `onConnect()`, so the listener is added again after each reconnection.

## In JSX

A component written by its class takes each event of its `events` field as a prop, `on` and the event's name: `onChanged` for `changed`, `onValueChange` for `valueChange`, `onPlay-source` for `play-source`. The callback receives the detail then the event, as with `register`, and TypeScript checks both:

```tsx
<MyComponent onChanged={(value) => console.log('changed to', value)} />
<MyPanel onClose={(reason, event) => this.hasUnsavedChanges() && event.preventDefault()} />
```

Such a prop hears what the component itself does: its own events, not one of the same name that bubbles up from an element slotted into it. The DOM's own handlers, written as the element's properties are, all in lower case, stay what they are on a component too: `onclick`, `oncontextmenu` or `onkeydown` hear every event of that name, the ones that bubble up included, and get the event (its `button`, its `preventDefault()`):

```tsx
<OrderList oncontextmenu={(event) => this.openMenu(event)} />
```

The listener lasts as long as the element, so it suits elements made in a list. An event whose name starts with a capital has no prop. A function given to an `on…` prop is always a listener, a hyphen in its name included: it is never written as an attribute. On an element written by its tag (`<my-list onItem-added={…} />`), the callback receives the event itself.

## Best practices

- Use `useEvents()` for component-specific custom events.
- Use the [Bus](../api/bus-class.md) for cross-component or global event communication.
- Define event types explicitly for full type safety.

## See also

- [Event Handling](./event-handling.md) — DOM event listeners with `this.on()`.
- [Cross-Component Communication](../communication/cross-components.md) — Using the Bus.
