# 📡 From child to parent

Communication between a child component and its parent is based on custom events.

The **parent registers** an event listener on the child. The **child emits** the event, which triggers the callbacks defined in the parent.

You can implement your own event system if you prefer, but **Jadis includes a built-in method** `useEvents` that ensures memory safety and supports **strong typing with both TypeScript and JSDoc** — making event handling clean, scalable, and type-safe.

## 💻 UseEvents Usage

::: code-group

```javascript
import { Jadis, html } from '@jadis/core';

class ChildComponent extends Jadis {
  static selector = 'child-component';
  static template = html`<button id="btn">Click me</button>`;

  events = this.useEvents({ someEvent: String });

  onConnect() {
    this.getElement('#btn').addEventListener('click', () => {
      this.events.emit('someEvent', 'Button clicked!');
    });
  }
}

class ParentComponent extends Jadis {
  static selector = 'parent-component';
  static template = html`
    <child-component></child-component>
    <p id="message"></p>
  `;

  onConnect() {
    this.childComponent.events.register('someEvent', (data) => {
      this.messageElement.textContent = data;
    });
  }

  get messageElement() {
    return this.getElement('#message');
  }

  get childComponent() {
    return this.getElement('child-component');
  }
}

ChildComponent.register();
ParentComponent.register();
```

```typescript
import { Jadis, html } from '@jadis/core';

class ChildComponent extends Jadis {
  static readonly selector = 'child-component';
  static readonly template = html`<button id="btn">Click me</button>`;

  events = this.useEvents<{
    someEvent: string;
  }>();

  onConnect() {
    this.getElement('#btn').addEventListener('click', () => {
      this.events.emit('someEvent', 'Button clicked!');
    });
  }
}

class ParentComponent extends Jadis {
  static readonly selector = 'parent-component';
  static readonly template = html`
    <child-component></child-component>
    <p id="message"></p>
  `;

  onConnect() {
    this.childComponent.events.register('someEvent', (data) => {
      this.messageElement.textContent = data;
    });
  }

  private get messageElement(): HTMLParagraphElement {
    return this.getElement('#message');
  }

  private get childComponent(): ChildComponent {
    return this.getElement('child-component');
  }
}

ChildComponent.register();
ParentComponent.register();
```

```javascript [js-doc]
// @ts-check
import { Jadis, html } from '@jadis/core';

class ChildComponent extends Jadis {
  /** @type {`${string}-${string}`} */
  static selector = 'child-component';
  static template = html`<button id="btn">Click me</button>`;

  /** @type {import('@jadis/core').UseEventsHandler<{someEvent: string}>} */
  events = this.useEvents();

  onConnect() {
    this.getElement('#btn').addEventListener('click', () => {
      this.events.emit('someEvent', 'Button clicked!');
    });
  }
}

class ParentComponent extends Jadis {
  /** @type {`${string}-${string}`} */
  static selector = 'parent-component';
  static template = html`
    <child-component></child-component>
    <p id="message"></p>
  `;

  onConnect() {
    this.childComponent.events.register('someEvent', (data) => {
      this.messageElement.textContent = data;
    });
  }

  /** @returns {HTMLParagraphElement} */
  get messageElement() {
    return this.getElement('#message');
  }

  /** @returns {ChildComponent} */
  get childComponent() {
    return this.getElement('child-component');
  }
}

ChildComponent.register();
ParentComponent.register();
```

:::

## 🧠 Typing the Event System

The best way to type the event system is with **TypeScript** or **JSDoc**. With either, you can pass an interface that clearly describes what each event’s payload should be.

## 📎 Note

If you don’t want to send a payload, you can define the event as `undefined`, like so:

```typescript
{
  someEvent: undefined;
}
```

Even when using plain JavaScript, you can still provide **partial typing** by passing an object that defines each event name as a key and its type as the corresponding value.

Just use **primitive constructors** like:

- Number
- String
- Boolean
- BigInt
- Symbol
- Function
- Array
- Object

```javascript
{
  someEvent: String,
  someOther: Object,
}
```
