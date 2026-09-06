# Jadis Class

The `Jadis` class is the abstract base class for all components. Extend it to create custom elements with built-in templating, lifecycle management, and DOM helpers.

## Import

```typescript
import { Jadis, css } from '@jadis/core';
```

## Static properties

| Property | Type | Default | Description |
|---|---|---|---|
| `selector` | `string` | _(required)_ | The custom element tag name. It must contain a hyphen. |
| `template` | `string` | `''` | Reserved for future use. |
| `useShadowDom` | `boolean` | `true` | Whether to attach a shadow root. Set to `false` for light-DOM rendering. |

Attributes are observed through `useAttributes({ ...callbacks })`; do not declare `observedAttributes` for that API.

## Static methods

### `register()`

Registers the component as a custom element.

```typescript
MyComponent.register();
```

### `toTemplate(options?, slotted?)`

Creates and returns a component instance with optional properties, attributes, and slotted content.

```typescript
const slotted = document.createDocumentFragment();
slotted.append(document.createElement('slot-content'));
const instance = MyComponent.toTemplate(
  { props: { title: 'Hello' }, attrs: { theme: 'dark' } },
  slotted
);
```

See [toTemplate()](../templating/to-template.md) for details.

## Instance properties

| Property | Type | Description |
|---|---|---|
| `isConnected` | `boolean` | Whether the component is currently in the DOM. |
| `shadowRoot` | `ShadowRoot \| null` | The shadow root, or `null` if `useShadowDom` is `false`. |

## Lifecycle methods

Override these methods to respond to lifecycle events:

| Method | Timing |
|---|---|
| `onConnect()` | After the component is connected and its template is rendered. |
| `onDisconnect()` | When the component is removed from the DOM. |

See [Lifecycle](../guides/lifecycle.md) for details.

## Template methods

| Method | Return type | Description |
|---|---|---|
| `templateHtml()` | `Node` | Returns the component's DOM structure. |
| `templateCss()` | `string` | Returns CSS rules for the component. |

See [Templates](../guides/templates.md) and [Styles](../templating/css.md).

## DOM helpers

| Method | Description |
|---|---|
| `getElement<T>(query)` | Find an element by CSS selector. Supports `>>>` for shadow traversal. |
| `useRefs(mapFn)` | Create typed references to multiple elements. |
| `toggleClass(className, condition)` | Add or remove a class based on a boolean. |
| `useAttributes(callbacks)` | Create attribute getters and change callbacks. |

## State and events

| Method | Description |
|---|---|
| `useChange(initial, onChange, options?)` | State with getter/setter and change callback. |
| `useEvents<T>()` | Type-safe event emitter with `register()` and `emit()`. |
| `onBus(bus, eventName, callback)` | Listen to events on a shared Bus. |
| `this.on(element, event, callback)` | Auto-cleaned DOM event listener. |

## Example

```tsx
import { Jadis, css } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  private readonly refs = this.useRefs((ref) => ({
    display: ref<HTMLSpanElement>('span'),
    button: ref<HTMLButtonElement>('button'),
  }));

  private readonly count = this.useChange(0, (value) => {
    this.refs.display.textContent = value.toString();
  }, { immediate: true });

  templateHtml(): Node {
    return <p>Count: <span></span> <button type="button">+</button></p>;
  }

  templateCss(): string {
    return css`:host { display: block; }`;
  }

  onConnect(): void {
    this.on(this.refs.button, 'click', () => this.count.set((value) => value + 1));
  }
}

MyComponent.register();
```

## See also

- [Your First Component](../guides/first-component.md)
- [Lifecycle](../guides/lifecycle.md)
