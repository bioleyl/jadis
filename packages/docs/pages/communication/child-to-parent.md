# From child to parent

Communication between a child component and its parent is based on custom events.

The **parent registers** an event listener on the child. The child **emits** the event, which triggers the callbacks defined in the parent.

You can implement your own event system if you prefer, but *Jadis* **includes a built-in method** `useEvents` that ensures memory safety and supports **strong typing with both TypeScript and JSDoc**, making event handling clean, scalable, and type-safe.

## Signature

The main idea is to pass an interface to the function's generic in TypeScript and in JSDoc. In JavaScript, we need to use an oject that represents the interface as close as possible.

In JavaScript an object or an array can not be described more precisely than **Object** and **Array**.

You can read more about [typing events](#typing-the-event-system)!

:::code-group

```javascript
useEvents({eventName: PrimitiveConstructor});
// PrimitiveConstructor can be any primitive constructor: 
// String, Number, Boolean, etc.
```

```typescript
useEvents<{eventName: Type}>();
```

```javascript[js-doc]
/** @type {import('@jadis/core').UseEventsHandler<{eventName: Type}>} */
useEvents();
```

:::

### Parameter

- An `object` used only for typing in JavaScript and JSDoc, unused in TypeScript, `{someEvent: PrimitiveConstructor}`

:::code-group

```javascript
const events = this.useEvents({someEvent: String});
```

```[js-doc]
/** @type {import('@jadis/core').UseEventsHandler<{someEvent: string}>} */
  events = this.useEvents();
```

:::

### Return value

- An object with 2 methods: **register** and **emit**.
  - `register` is  used to subscribe to an event
  - `emit` is used to emit an event.

## UseEvents Usage

::: code-group

```javascript
import { Jadis, html, createSelector } from '@jadis/core';

class ChildComponent extends Jadis {
  static selector = createSelector('child-component');

  events = this.useEvents({ someEvent: String });

  templateHtml() {
    return html`<button id="btn">Click me</button>`;
  }

  onConnect() {
    this.getElement('#btn').addEventListener('click', () => {
      this.events.emit('someEvent', 'Button clicked!');
    });
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  refs = this.useRefs((ref) => ({
    message: ref('#message'),
    childComponent: ref('child-component'),
  }));

  templateHtml() {
    return html`
      <child-component></child-component>
      <p id="message"></p>
    `;
  }

  onConnect() {
    this.refs.childComponent.events.register('someEvent', (data) => {
      this.refs.message.textContent = data;
    });
  }
}

ChildComponent.register();
ParentComponent.register();
```

```typescript
import { Jadis, html } from '@jadis/core';

class ChildComponent extends Jadis {
  static readonly selector = 'child-component';

  events = this.useEvents<{
    someEvent: string;
  }>();

  templateHtml(): DocumentFragment {
    return html`<button id="btn">Click me</button>`;
  }

  onConnect(): void {
    this.getElement('#btn').addEventListener('click', () => {
      this.events.emit('someEvent', 'Button clicked!');
    });
  }
}

class ParentComponent extends Jadis {
  static readonly selector = 'parent-component';

  refs = this.useRefs((ref) => ({
    message: ref<HTMLParagraphElement>('#message'),
    childComponent: ref<ChildComponent>('child-component'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <child-component></child-component>
      <p id="message"></p>
    `;
  }

  onConnect(): void {
    this.refs.childComponent.events.register('someEvent', (data) => {
      this.refs.message.textContent = data;
    });
  }
}

ChildComponent.register();
ParentComponent.register();
```

```javascript [js-doc]
// @ts-check
import { Jadis, html, createSelector } from '@jadis/core';

class ChildComponent extends Jadis {
  static selector = createSelector('child-component');

  /** @type {import('@jadis/core').UseEventsHandler<{someEvent: string}>} */
  events = this.useEvents();

  templateHtml() {
    return html`<button id="btn">Click me</button>`;
  }

  onConnect() {
    this.getElement('#btn').addEventListener('click', () => {
      this.events.emit('someEvent', 'Button clicked!');
    });
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  refs = this.useRefs((ref) => ({
    /** @type {HTMLParagraphElement} */
    message: ref('#message'),
    /** @type {ChildComponent} */
    childComponent: ref('child-component'),
  }));

  templateHtml() {
    return html`
      <child-component></child-component>
      <p id="message"></p>
    `;
  }

  onConnect() {
    this.refs.childComponent.events.register('someEvent', (data) => {
      this.refs.message.textContent = data;
    });
  }
}

ChildComponent.register();
ParentComponent.register();
```

:::

## Typing the Event System

The best way to type the event system is with **TypeScript** or **JSDoc**. With either, you can pass an interface that clearly describes what each event’s payload should be.

## Note

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
