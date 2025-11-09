# ⚙️ First Component

Let’s build a real component using **@jadis/core**.

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

## 🎨 Optional: Adding styles

You can style your component by adding a `static style` property:

```javascript
import { Jadis, css, createSelector } from '@jadis/core';

...

class ClickButton extends Jadis {
  static selector = createSelector('click-button');

  templateCss() {
    return css`button { padding: 0.5rem; font-size: 1rem; }`;
  }

  templateHtml() {
    ...
  }

  ...
}
```
