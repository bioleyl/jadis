# ⚙️ First Component

Let’s build a real component using **@jadis/core**.

## 🧩 Define a Button Component

We’ll create a reusable button that shows a label and keeps track of how many times it's clicked.

::: code-group

```javascript
import { Jadis, html, createSelector } from '@jadis/core';

class ClickButton extends Jadis {
  static selector = createSelector('click-button');
  count = 0;

  templateHtml() {
    return html`
      <button id="btn"></button>
      <p>Clicked <span id="count">0</span> times</p>
    `;
  }

  onConnect() {
    this.buttonElement.textContent = this.getAttribute('label') || 'Click me';
    this.on(this.buttonElement, 'click', () => this.increment());
  }

  increment() {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
  }

  get buttonElement() {
    return this.getElement('#btn');
  }
}

ClickButton.register();
```

```typescript
import { Jadis, html } from '@jadis/core';

class ClickButton extends Jadis {
  static readonly selector = 'click-button';
  private count = 0;

  templateHtml(): DocumentFragment {
    return html`
      <button id="btn"></button>
      <p>Clicked <span id="count">0</span> times</p>
    `;
  }

  onConnect(): void {
    this.buttonElement.textContent = this.getAttribute('label') || 'Click me';
    this.on(this.buttonElement, 'click', () => this.increment());
  }

  private increment(): void {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
  }

  private get buttonElement(): HTMLButtonElement {
    return this.getElement('#btn');
  }
}

ClickButton.register();
```

```javascript [js-doc]
// @ts-check
import { Jadis, html, createSelector } from '@jadis/core';

class ClickButton extends Jadis {
  static selector = createSelector('click-button');
  count = 0;

  templateHtml() {
    return html`
      <button id="btn"></button>
      <p>Clicked <span id="count">0</span> times</p>
    `;
  }

  onConnect() {
    this.buttonElement.textContent = this.getAttribute('label') || 'Click me';
    this.on(this.buttonElement, 'click', () => this.increment());
  }

  increment() {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
  }

  /** @returns {HTMLButtonElement} */
  get buttonElement() {
    return this.getElement('#btn');
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
