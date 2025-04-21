# First Component

Let’s build a real component using **@jadis/core**.

## Define a Button Component

We’ll create a reusable button with a label and a click counter.

::: code-group

```javascript
import { Jadis, html } from '@jadis/core';

const template = html`
  <button id="btn"></button>
  <p>Clicked <span id="count">0</span> times</p>
`;

class ClickButton extends Jadis {
  static selector = 'click-button';
  static template = template;

  count = 0;

  onConnect() {
    this.getElement('#btn').textContent = this.getAttribute('label') || 'Click me';
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
    this.getElement('#btn').textContent = this.getAttribute('label') || 'Click me';
    this.on(this.getElement('#btn'), 'click', () => this.increment());
  }

  private increment(): void {
    this.count++;
    this.getElement('#count').textContent = this.count.toString();
  }
}

ClickButton.register();
```

:::

And in your HTML:

```html
<click-button label="Click me"></click-button>
```

## Concept introduced
- **Jadis**: The base class for all components.
- **html**: A tagged template literal for creating HTML templates.
- **static selector**: The custom element name.
- **static template**: The HTML template for the component.
- **onConnect**: A lifecycle method called when the component is connected to the DOM.
- **getElement**: A method to get elements within the component's template.
- **on**: A method to add event listeners with safe unregistering.
- **getAttribute**: A method to get attributes from the component.
- **register**: A method to register the component as a custom element.

## Optional: adding styles
You can add styles to your component by using the `static style` property.

```javascript
import { Jadis, html, css } from '@jadis/core';

...

class ClickButton extends Jadis {
  static selector = 'click-button';
  static template = template;
  static style = css`button { padding: 0.5rem; font-size: 1rem; }`;

  ...
}
```
