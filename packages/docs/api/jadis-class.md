# Jadis Class

The `Jadis` class is the abstract base class for all components. Extend it to create custom elements with built-in templating, lifecycle management, and DOM helpers.

## Import

```typescript
import { Jadis } from '@jadis/core';
```

## Static Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `selector` | `string` | _(required)_ | The custom element tag name. Must contain a hyphen. |
| `template` | `string` | `''` | Reserved for future use. |
| `observedAttributes` | `string[]` | `[]` | Attribute names to observe via `attributeChangedCallback`. |
| `useShadowDom` | `boolean` | `true` | Whether to attach a shadow root. Set to `false` for light DOM rendering. |

## Static Methods

### `register()`

Registers the component as a custom element.

```typescript
MyComponent.register();
```

Throws if `selector` is not defined.

### `toTemplate(options?, slotted?)`

Creates and returns a component instance with optional props, attributes, and slotted content.

```typescript
const instance = MyComponent.toTemplate(
  { props: { title: 'Hello' }, attrs: { theme: 'dark' } },
  html`<slot-content></slot-content>`
);
```

See [toTemplate()](../templating/to-template.md) for details.

## Instance Properties

| Property | Type | Description |
|---|---|---|
| `isConnected` | `boolean` | Whether the component is currently in the DOM. |
| `shadowRoot` | `ShadowRoot \| null` | The shadow root, or `null` if `useShadowDom` is `false`. |

## Lifecycle Methods

Override these methods to respond to lifecycle events:

| Method | Timing |
|---|---|
| `onConnect()` | After the component is connected and its template is rendered. |
| `onDisconnect()` | When the component is removed from the DOM. |

See [Lifecycle](../guides/lifecycle.md) for details.

## Template Methods

| Method | Return Type | Description |
|---|---|---|
| `templateHtml()` | `DocumentFragment` | Returns the HTML structure of the component. |
| `templateCss()` | `string` | Returns CSS rules for the component. |

See [Templates](../guides/templates.md) and [Styles](../templating/css.md).

## DOM Helpers

| Method | Description |
|---|---|
| `getElement<T>(query)` | Find an element by CSS selector. Supports `>>>` for shadow traversal. |
| `useRefs(mapFn)` | Create typed references to multiple elements. |
| `toggleClass(className, condition)` | Add or remove a class based on a boolean. |
| `useAttributes(...names)` | Create reactive attribute getters. |

See [DOM Helpers](../dom/get-element.md) and [Templates](../templating/classes.md).

## State & Events

| Method | Description |
|---|---|
| `useChange(initial, onChange, options?)` | Reactive state with getter/setter and change callback. |
| `useEvents<T>()` | Type-safe event emitter with `register()` and `emit()`. |
| `onBus(bus, eventName, callback)` | Listen to events on a shared Bus. |
| `this.on(element, event, callback)` | Auto-cleaned DOM event listener. |

See [State & Events](../state/use-change.md).

## Internal Helpers

| Property/Method | Description |
|---|---|
| `killSignal` | An `AbortSignal` aborted on disconnect. Used for automatic cleanup. |
| `attributesCallback` | Internal map of attribute change handlers. |
| `onConnectActions` | Queue of actions deferred until connection. |

## Example

```typescript
import { Jadis, html, createSelector } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = createSelector('my-component');

  private readonly count = this.useChange(0, (val) => {
    this.refs.display.textContent = val.toString();
  }, { immediate: true });

  readonly refs = this.useRefs((ref) => ({
    display: ref('span'),
    button: ref('button'),
  }));

  templateHtml(): DocumentFragment {
    return html`<p>Count: <span></span> <button>+</button>`;
  }

  templateCss(): string {
    return css`:host { display: block; }`;
  }

  onConnect(): void {
    this.on(this.refs.button, 'click', () =>
      this.count.set((v) => v + 1)
    );
  }
}

MyComponent.register();
```

## See Also

- [Your First Component](../guides/first-component.md) — Getting started guide.
- [Lifecycle](../guides/lifecycle.md) — Lifecycle hooks deep dive.
