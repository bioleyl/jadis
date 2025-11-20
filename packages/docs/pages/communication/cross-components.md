# Cross-Component Communication

While not the trendiest tool in modern frontend circles, the **EventBus** remains one of the most underrated solutions for cross-component communication. *Jadis* embraces this pattern with intention, offering a built-in Bus system that’s not only easy to use, but also memory-safe and fully typed for **TypeScript** and **JSDoc** users.

*Jadis* brings you a bus helper for handling events in a type-safe manner. Even in **plain JavaScript**, *Jadis* allows for **partial typing** by defining event payloads using primitive constructors like `String`, `Number` or other constructors. This gives you lightweight type hints without switching languages, making event wiring safer and more expressive, even in a pure JS project.

You don’t need to reinvent global coordination. With *Jadis*, you get all the power of a scalable event system, minus the complexity.

## Bus creation

Here's how to create a new event bus:

::: code-group

```javascript
const myBus = new Bus({
  someEvent: String,
  anotherEvent: Number,
  noPayloadEvent: undefined,
});
```

```typescript
const myBus = new Bus<{
  someEvent: string;
  anotherEvent: number;
  noPayloadEvent: undefined;
}>();
```

```javascript [js-doc]
/** @type {Bus<{ someEvent: string, anotherEvent: number, noPayloadEvent: undefined }>} */
const myBus = new Bus();
```

:::

When using plain JavaScript, event types are declared using primitive constructors like `Number`, `String`, `Boolean`, `BigInt`, `Symbol`, `Function`, `Array` or `Object`

## Bus Usage

Once the bus is defined, you can **register listeners** or **emit events** freely between components.

::: code-group

```javascript
import { Bus, Jadis, html, createSelector } from '@jadis/core';

const myBus = new Bus({
  someEvent: String,
  anotherEvent: Number,
  noPayloadEvent: undefined,
});

class ReceiverComponent extends Jadis {
  static selector = createSelector('receiver-component');

  templateHtml() {
    return html`<p></p>`;
  }

  onConnect() {
    this.onBus(myBus, 'someEvent', (value) => {
      this.getElement('p').textContent = `Received: ${value}`;
    });
  }
}

class EmitterComponent extends Jadis {
  static selector = createSelector('emitter-component');

  templateHtml() {
    return html`<button>ClickMe</button>`;
  }

  onConnect() {
    this.getElement('button').addEventListener('click', () => {
      myBus.emit('someEvent', 'Hello from EmitterComponent!');
    });
  }
}

ReceiverComponent.register();
EmitterComponent.register();
```

```typescript
import { Bus, Jadis, html } from '@jadis/core';

const myBus = new Bus<{
  someEvent: string;
  anotherEvent: number;
  noPayloadEvent: undefined;
}>();

class ReceiverComponent extends Jadis {
  static readonly selector = 'receiver-component';

  templateHtml(): DocumentFragment {
    return html`<p></p>`;
  }

  onConnect(): void {
    this.onBus(myBus, 'someEvent', (value) => {
      this.getElement('p').textContent = `Received: ${value}`;
    });
  }
}

class EmitterComponent extends Jadis {
  static readonly selector = 'emitter-component';

  templateHtml(): DocumentFragment {
    return html`<button>ClickMe</button>`;
  }

  onConnect(): void {
    this.getElement('button').addEventListener('click', () => {
      myBus.emit('someEvent', 'Hello from EmitterComponent!');
    });
  }
}

ReceiverComponent.register();
EmitterComponent.register();
```

```javascript [js-doc]
// @ts-check
import { Bus, Jadis, html, createSelector } from '@jadis/core';

/** @type {Bus<{ someEvent: string, anotherEvent: number, noPayloadEvent: undefined }>} */
const myBus = new Bus();

class ReceiverComponent extends Jadis {
  static selector = createSelector('receiver-component');

  templateHtml() {
    return html`<p></p>`;
  }

  onConnect() {
    this.onBus(myBus, 'someEvent', (value) => {
      this.getElement('p').textContent = `Received: ${value}`;
    });
  }
}

class EmitterComponent extends Jadis {
  static selector = createSelector('emitter-component');
  static template = html`<button>ClickMe</button>`;

  onConnect() {
    this.getElement('button').addEventListener('click', () => {
      myBus.emit('someEvent', 'Hello from EmitterComponent!');
    });
  }
}

ReceiverComponent.register();
EmitterComponent.register();
```

:::

## Usage Outside of *Jadis* Components

You can also use the bus outside of *Jadis* components. For example, in services or utilities. If you're registering listeners directly (without Jadis), it's important to provide an `AbortSignal` to ensure proper cleanup and avoid memory leaks.

```javascript
// Create an AbortController to manage cleanup
const abortController = new AbortController();

// Register to an event
myBus.register(
  'someEvent',
  (value) => console.log(`Bus received someEvent with value: ${value}`),
  abortController.signal
);

// Emit an event
myBus.emit('someEvent', 'Initial value');

// Clean up when done
abortController.abort();
```
