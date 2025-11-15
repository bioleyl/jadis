# ⚙️ First Component

## The Essentials of a Jadis Component

- A component in **@jadis/core** is a class that extends from *Jadis*
  
  ```javascript
    class MyComponent extends Jadis {}
  ```

- The component needs to be exported if used elsewhere

  ```javascript
    export class MyComponent extends Jadis {}
  ```

- The component needs a selector property in order to be used in the DOM
  
  :::code-group
  
  ```javascript
    export class MyComponent extends Jadis {
      selector = createSelector('my-component');
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

## 🧩 Define a Button Component

We’ll create a reusable button that shows a label and keeps track of how many times it's clicked.

::: code-group

```javascript
import { Jadis, html, createSelector } from '@jadis/core';

class ClickButton extends Jadis {
  static selector = createSelector('click-button');

  refs = this.useRefs((ref) => ({
    button: ref('button'),
    count: ref('#count'),
  }));

  #count = 0;

  templateHtml() {
    return html`
      <button id="btn"></button>
      <p>Clicked <span id="count">0</span> times</p>
    `;
  }

  onConnect() {
    const { button } = this.refs;
    button.textContent = this.getAttribute('label') || 'Click me';
    this.on(button, 'click', () => this.increment());
  }

  increment() {
    this.#count++;
    this.refs.count.textContent = this.#count.toString();
  }
}

ClickButton.register();
```

```typescript
import { Jadis, html } from '@jadis/core';

class ClickButton extends Jadis {
  static readonly selector = 'click-button';
  
  readonly refs = this.useRefs((ref) =>({
    button: ref('button'),
    count: ref<HTMLSpanElement>('#count'),
  }));

  private count = 0;

  templateHtml(): DocumentFragment {
    return html`
      <button id="btn"></button>
      <p>Clicked <span id="count">0</span> times</p>
    `;
  }

  onConnect(): void {
    const { button } = this.refs;
    button.textContent = this.getAttribute('label') || 'Click me';
    this.on(button, 'click', () => this.increment());
  }

  private increment(): void {
    this.count++;
    this.refs.count.textContent = this.count.toString();
  }
}

ClickButton.register();
```

```javascript [js-doc]
// @ts-check
import { Jadis, html, createSelector } from '@jadis/core';

class ClickButton extends Jadis {
  static selector = createSelector('click-button');

  refs = this.useRefs((ref) => ({
    button: ref('button'),
    /** @type HTMLSpanElement */
    count: ref('#count'),
  }));
  
  #count = 0;

  templateHtml() {
    return html`
      <button id="btn"></button>
      <p>Clicked <span id="count">0</span> times</p>
    `;
  }

  onConnect() {
    const { button } = this.refs;
    button.textContent = this.getAttribute('label') || 'Click me';
    this.on(button, 'click', () => this.increment());
  }

  increment() {
    this.#count++;
    this.refs.count.textContent = this.#count.toString();
  }
}

ClickButton.register();
```

:::

Then in your HTML:

```html
<click-button label="Click me"></click-button>
```

## 🎨 Adding styles

See [documentation about adding style](../styling/add-style.md).
