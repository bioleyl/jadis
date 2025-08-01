# ⚙️ First Component

Let’s build a real component using **@jadis/core**.

## 🧩 Define a Button Component

We’ll create a reusable button that shows a label and keeps track of how many times it's clicked.

::: code-group

```javascript
import { Jadis, html, createSelector } from '@jadis/core';

const template = html`
  <button id="btn"></button>
  <p>Clicked <span id="count">0</span> times</p>
`;

class ClickButton extends Jadis {
  static selector = createSelector('click-button');
  static template = template;

  count = 0;

  onConnect() {
    this.getElement('#btn').textContent =
      this.getAttribute('label') || 'Click me';
    this.on(this.getElement('#btn'), 'click', () => this.increment());
  }

  increment() {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
  }
}

ClickButton.register();
```

```typescript
import { Jadis, html } from '@jadis/core';

const template = html`
  <button id="btn"></button>
  <p>Clicked <span id="count">0</span> times</p>
`;

class ClickButton extends Jadis {
  static readonly selector = 'click-button';
  static readonly template = template;

  private count = 0;

  onConnect(): void {
    this.getElement('#btn').textContent =
      this.getAttribute('label') || 'Click me';
    this.on(this.getElement('#btn'), 'click', () => this.increment());
  }

  private increment(): void {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
  }
}

ClickButton.register();
```

```javascript [js-doc]
// @ts-check
import { Jadis, html, createSelector } from '@jadis/core';

const template = html`
  <button id="btn"></button>
  <p>Clicked <span id="count">0</span> times</p>
`;

class ClickButton extends Jadis {
  static selector = createSelector('click-button');
  static template = template;

  count = 0;

  onConnect() {
    this.getElement('#btn').textContent =
      this.getAttribute('label') || 'Click me';
    this.on(this.getElement('#btn'), 'click', () => this.increment());
  }

  increment() {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
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
import { Jadis, html, css, createSelector } from '@jadis/core';

...

class ClickButton extends Jadis {
  static selector = createSelector('click-button');
  static template = template;
  static style = css`button { padding: 0.5rem; font-size: 1rem; }`;

  ...
}
```
