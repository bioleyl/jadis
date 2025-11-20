# First Component

## The Essentials of a *Jadis* Component

- A component in **@jadis/core** is a class that extends from *Jadis*
  
  ```javascript
    class MyComponent extends Jadis {}
  ```

- The component needs a selector property in order to be used in the DOM
  
  :::code-group
  
  ```javascript
    export class MyComponent extends Jadis {
      static selector = createSelector('my-component');
    }
    // use createSelector() to safely check the selector is of type 
    // ${string}-${string} 
  ```

  ```typescript
    export class MyComponent extends Jadis {
      static readonly selector = createSelector('my-component');
    }
    // selector property needs to be readonly
  ```

- The component needs to be registered by calling the `register()` method

  ```javascript
    export class MyComponent extends Jadis {
      ...
    }

    MyComponent.register();
  ```

Now, let’s build a real component using **@jadis/core**!

## Define a CounterButton Component

We’ll create a reusable button that shows a label and keeps track of how many times it's clicked.

::: code-group

```javascript
import { Jadis, html, createSelector } from '@jadis/core';

class CounterButton extends Jadis {
  static selector = createSelector('counter-component');

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
    this.on(this.refs.incrementButton, 'click', () => this.count.set((v) => v + 1));
  }
}

CounterButton.register();
```

```typescript
import { Jadis, html } from '@jadis/core';

class CounterButton extends Jadis {
  static readonly selector = 'counter-component';

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
    this.on(this.refs.incrementButton, 'click', () => this.count.set((v) => v + 1));
  }
}

CounterButton.register();
```

:::

Then in your HTML, you can use it simply by using its tag name:

```html
<counter-button></counter-button>
```

Or you can use it with `toTemplate()`, see [dedicated page](../templating/to-template.md) on the documentation.

## Adding style with CSS

See [documentation about adding style](../templating/add-style.md).
