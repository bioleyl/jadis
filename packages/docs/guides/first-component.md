# Your First Component

A Jadis component is a class that extends `Jadis` and registers itself as a [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements). This guide walks you through creating your first component from scratch.

## Anatomy of a Component

Every Jadis component requires three things:

1. **Extend `Jadis`** — Your class must inherit from the `Jadis` base class.
2. **Define a selector** — A unique tag name (e.g., `my-counter`) used to identify the custom element in the DOM.
3. **Call `register()`** — Registers the component with the browser's `customElements` registry.

```typescript
import { Jadis } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = 'my-component';
}

MyComponent.register();
```

## Building a Counter Component

Let's build a reusable button that tracks and displays a click count. This example demonstrates several core Jadis concepts: templating, state management, event handling, and element references.

::: code-group

```typescript [TypeScript]
import { Jadis, html } from '@jadis/core';

class CounterButton extends Jadis {
  static readonly selector = 'counter-button';

  private readonly count = this.useChange(0, (val) => {
    this.refs.count.textContent = val.toString();
  }, { immediate: true });

  private readonly refs = this.useRefs((ref) => ({
    count: ref('span'),
    incrementButton: ref('button'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect(): void {
    this.on(this.refs.incrementButton, 'click', () =>
      this.count.set((v) => v + 1)
    );
  }
}

CounterButton.register();
```

```javascript [JavaScript]
import { Jadis, html, createSelector } from '@jadis/core';

class CounterButton extends Jadis {
  static selector = createSelector('counter-button');

  count = this.useChange(0, (val) => {
    this.refs.count.textContent = val.toString();
  }, { immediate: true });

  refs = this.useRefs((ref) => ({
    count: ref('span'),
    incrementButton: ref('button'),
  }));

  templateHtml() {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect() {
    this.on(this.refs.incrementButton, 'click', () =>
      this.count.set((v) => v + 1)
    );
  }
}

CounterButton.register();
```

```javascript [JSDoc]
// @ts-check
import { Jadis, html, createSelector } from '@jadis/core';

class CounterButton extends Jadis {
  static selector = createSelector('counter-button');

  /** @type {import('@jadis/core').UseChangeHandler<number>} */
  count = this.useChange(0, (val) => {
    this.refs.count.textContent = val.toString();
  }, { immediate: true });

  refs = this.useRefs((ref) => ({
    /** @type {HTMLSpanElement} */
    count: ref('span'),
    /** @type {HTMLButtonElement} */
    incrementButton: ref('button'),
  }));

  templateHtml() {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect() {
    this.on(this.refs.incrementButton, 'click', () =>
      this.count.set((v) => v + 1)
    );
  }
}

CounterButton.register();
```

:::

## Using the Component

After registration, use your component like any standard HTML element:

```html
<counter-button></counter-button>
```

## What's Happening?

| Concept | Method / Property | Purpose |
|---|---|---|
| **Selector** | `static selector` | Defines the custom element tag name |
| **Template** | `templateHtml()` | Returns the component's HTML structure |
| **State** | `useChange()` | Manages reactive state with change callbacks |
| **Refs** | `useRefs()` | Creates typed references to DOM elements |
| **Events** | `this.on()` | Registers auto-cleaned-up event listeners |
| **Lifecycle** | `onConnect()` | Called when the component is added to the DOM |

## Next Steps

- Learn about [lifecycle hooks](./lifecycle.md) for managing component behavior over time.
- Explore [templating](../templating/css.md) to add styles and structure.
- Read the [API reference](../api/jadis-class.md) for a complete list of available methods.
