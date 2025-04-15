## @jadis/core

The minimal toolkit at the heart of **Jadis**.  
Build web components the old-fashioned way — but better.

> No magic. No runtime. No surprises.

---

## 📦 Installation

```bash
npm install @jadis/core
```

---

## ✨ Features

`@jadis/core` provides low-level utilities to help you define, mount, and manage native Web Components without boilerplate.

### 1. `extends Jadis`

Create a class that extends `Jadis` to define your component.

```js
import { Jadis } from '@jadis/core';

class MyComponent extends Jadis {
  static readonly selector = "my-component";
  static readonly template = `<p>Hello World</p>`;
  static readonly style = `p { color: blue; }`;

  onConnect() {
    // Called when the component is connected to the DOM
  }
}
```

### 2. `register()`

Register your component with the browser.

```js
MyComponent.register();
```

### 3. `getElement(query)`

Get a reference to an element in the component's shadow DOM.

```js
const myElement = this.getElement('p');
```
➡️ You can use any valid CSS selector.

There is a shadow DOM piercing feature that allows you to access elements inside a child shadow DOM.

```js
const childElement = this.getElement('child-component >>> p');
```
➡️ You can use any valid CSS selector. The `>>>` operator is used to pierce the shadow DOM boundary.

You can type the return value of `getElement` with typescript or JSdoc.

```typescript
const myElement = this.getElement<HTMLParagraphElement>('p');
```

```js
/*
 * @type {HTMLParagraphElement}
 */
get paragraph() {
  return this.getElement('p');
}
```

---

## 🔧 Coming Soon

- `@jadis/router` — for tiny, component-first routing
- `@jadis/store` — a dead-simple global state container

---

## 🧠 Philosophy

Jadis avoids unnecessary abstractions. It doesn’t use decorators to stay fully compatible with both **vanilla JavaScript** and **TypeScript**, with no transpilation required.
> Build fast. Stay sane. Remember the web as it was — and could still be.

---

## 🛠 Contributing

Feel free to open issues or submit PRs. Simplicity is key — every feature must be understandable in under 5 minutes.

---

## 📜 License

MIT — Made with nostalgia ☕
