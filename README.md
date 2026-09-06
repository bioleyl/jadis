# *Jadis*

**Jadis** is a minimal JavaScript toolkit for building web interfaces using native Web Components: no virtual DOM, no reactivity system, and no framework runtime. Use native DOM APIs directly, with optional JSX support through standard TypeScript or JavaScript tooling.

> The web, like it used to be.

## Documentation

You can find the full documentation on [github pages](https://bioleyl.github.io/jadis/).

For AI-assisted development, see the [AI-SKILL.md](AI-SKILL.md) guide.

## Why *Jadis*?

Modern frontend frameworks are powerful, but they come at a cost:

- Complex tooling and configuration
- Steep learning curves
- Bloated bundles
- Fragile abstractions

*Jadis* is dedicated to simplicity and bringing things back to the basics:

- Native Web Components
- No framework-specific runtime or component model
- Zero dependencies
- Works directly with native browser APIs

## What You Get

- A set of tiny helpers to make Web Components simpler and more enjoyable to use
- Simple templating with JSX
- A feeling of control and peace

## Installation

```bash
npm install @jadis/core
```

## Example

```typescript
import { Jadis } from '@jadis/core';

class HelloWorld extends Jadis {
  static readonly selector = 'hello-world';

  templateHtml(): Node {
    return <p>Hello, <span id="name"></span></p>;
  }

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

### TypeScript Setup

To enable JSX in TypeScript, add these settings to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@jadis/core"
  }
}
```

For JavaScript, use the same JSX settings in `jsconfig.json` together with `"checkJs": true`.

## Philosophy

*Jadis* isn't trying to replace React or Vue. It's here for when you want to:

- Build small, fast, maintainable UI pieces
- Avoid a bloated toolchain
- Use the platform, not fight it

## When to Use *Jadis*

Use it when you:

- Want simplicity and speed
- Build micro-frontends, design systems, or widgets
- Miss the days when you could understand your app in one file

Avoid it if you need:

- Complex state management
- SSR or hydration

## What *Jadis* doesn't do (on purpose)

*Jadis* is intentionally boring, in the best way.

- No virtual DOM, but real DOM, updated by you
- No magic reactivity, but direct control over state and updates
- No decorators or class gymnastics: it works with both TypeScript and vanilla JS
- Use native browser APIs directly, or use Vite when using JSX and TypeScript
- No over-engineered reactive stores: just event buses when you need global state, and they still work beautifully

> You'd be surprised how much you can build without the "modern essentials".

## Try It Out

Give it a spin. Build something in 5 minutes. Rediscover the joy of shipping features without wrestling with your framework.

```bash
npm install @jadis/core
```

> The web has always been powerful. *Jadis* reminds you how it used to feel.

## Contributing

Feel free to open issues or submit PRs. Simplicity is key!

## License

MIT - Made with ❤️, ☕, a bit of 🧠 and Neovim.
