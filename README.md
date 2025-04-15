# Jadis

**Jadis** is a minimal JavaScript toolkit for building web interfaces using native Web Components — no virtual DOM, no reactivity system, no compile step. Just clean, readable, native code.

> The web, like it used to be.

---

## 🤔 Why Jadis?

Modern frontend frameworks are powerful, but they come at a cost:

- Complex tooling and configuration
- Steep learning curves
- Bloated bundles
- Fragile abstractions

**Jadis** is for developers who are tired of that. It brings things back to the basics:

- ✅ Native Web Components
- ✅ No framework-specific syntax
- ✅ Zero dependencies
- ✅ Works with just a browser
- ✅ Works with both JavaScript and TypeScript — **no decorators require**

> Jadis intentionally avoids decorators to stay accessible and compatible with vanilla JavaScript as well as TypeScript, without needing transpilation or extra syntax.

---

## 🚀 What You Get

- A set of tiny libraries to make Web Components simpler and more enjoyable to use
- Simple templating without JSX or complex DSLs
- Lifecycle helpers without hooks or reactivity
- A feeling of control and peace 😌

---

## 📦 Installation

```bash
npm install @jadis/core
```

---

## 🧱 Example

```js
import { Jadis } from '@jadis/core';

class HelloWorldComponent extends Jadis {
  static readonly selector = "hello-world";
  static readonly template = `
    <h1>Hello World</h1>
    <p>Welcome <span></span> to the world of web components!</p>
  `;
  static readonly style = `
    h1 {
      color: blue;
    }
  `;

  onConnect(): void {
    const name = this.getAttribute("name") ?? "Jadis";
    this.refresh(name);
  }

  private refresh(name: string): void {
    this.getElement("span").textContent = name;
  }
}

HelloWorldComponent.register();
```

Then in your HTML:

```html
<hello-world name="Your name"></hello-world>
```

---

## 🧠 Philosophy

Jadis isn't trying to replace React or Vue. It's here for when you want to:

- Build small, fast, maintainable UI pieces
- Avoid a bloated toolchain
- Use the platform, not fight it

---

## 🔍 When to Use Jadis

Use it when you:

- Want simplicity and speed
- Build micro-frontends, design systems, or widgets
- Miss the days when you could understand your app in one file

Avoid it if you need:

- Complex state management
- Large-scale SPA routing
- SSR or hydration

---

## ❤️ Try It

Give it a spin. Build something in 5 minutes. Rediscover the joy of shipping features without wrestling with your framework.

```bash
npm install @jadis/core
```

> The web has always been powerful. Jadis reminds you how it used to feel.

---

MIT License — Made with nostalgia ☕


