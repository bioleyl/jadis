## Jadis

**Jadis** is a minimal JavaScript toolkit for building web interfaces using native Web Components — no virtual DOM, no reactivity system, no compile step. Just clean, readable, native code.

> The web, like it used to be.

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

## 🚀 What You Get

- A set of tiny libraries to make Web Components simpler and more enjoyable to use
- Simple templating without JSX or complex DSLs
- Lifecycle helpers without hooks or reactivity
- A feeling of control and peace 😌

## 📦 Installation

```bash
npm install @jadis/core
```

## 🧱 Example

```javascript
import { Jadis } from '@jadis/core';

class HelloWorld extends Jadis {
  static selector = 'hello-world';
  static template = '<p>Hello, <span id="name"></span></p>';

  onConnect() {
    this.getElement('#name').textContent = 'Jadis developers';
  }
}

HelloWorld.register();
```

Then in your HTML:

```html
<hello-world></hello-world>
```

## 🧠 Philosophy

**Jadis** isn't trying to replace React or Vue. It's here for when you want to:

- Build small, fast, maintainable UI pieces
- Avoid a bloated toolchain
- Use the platform, not fight it

## 🔍 When to Use Jadis

Use it when you:

- Want simplicity and speed
- Build micro-frontends, design systems, or widgets
- Miss the days when you could understand your app in one file

Avoid it if you need:

- Complex state management
- Large-scale SPA routing
- SSR or hydration

## 🚫 What Jadis doesn’t do (on purpose)

Jadis is intentionally boring — in the best way.

- ❌ No virtual DOM  
  ✅ Real DOM, updated by you
- ❌ No JSX / TSX  
  ✅ Plain HTML templates
- ❌ No magic reactivity  
  ✅ Direct control over state and updates
- ❌ No decorators or class gymnastics  
  ✅ Works with both TypeScript and vanilla JS
- ❌ No complex build setup  
  ✅ Just a browser and a script tag
- ❌ No over-engineered reactive stores  
  ✅ Just event buses when you need global state — and they still work beautifully

> You’d be surprised how much you can build without the “modern essentials.”

## ❤️ Try It Out

Give it a spin. Build something in 5 minutes. Rediscover the joy of shipping features without wrestling with your framework.

```bash
npm install @jadis/core
```

> The web has always been powerful. Jadis reminds you how it used to feel.

## ✨ Documentation

You can find the full documentation on [github](https://bioleyl.github.io/jadis/).

## 🛠 Contributing

Feel free to open issues or submit PRs. Simplicity is key!

## 📜 License

MIT — Made with ❤️, ☕, a bit of 🧠 and Neovim.
