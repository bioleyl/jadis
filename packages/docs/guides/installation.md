# Installation

Jadis is flexible and easy to get started with. You can use it via npm, with a boilerplate, or directly from a CDN. It provides **full type support** for both TypeScript and JSDoc-enabled JavaScript projects.

## Quick Start

The fastest way to begin is with one of the official boilerplates:

::: code-group

```bash [JavaScript]
npx @jadis/create js my-project
```

```bash [TypeScript]
npx @jadis/create ts my-project
```

:::

## NPM Installation

To install Jadis manually in an existing project:

```bash
npm install @jadis/core
```

Then create a component file:

```typescript
import { Jadis, createSelector, html } from '@jadis/core';

class HelloWorld extends Jadis {
  static readonly selector = 'hello-world';

  templateHtml(): DocumentFragment {
    return html`<p>Hello, <span id="name"></span></p>`;
  }

  onConnect(): void {
    this.getElement('#name').textContent = 'Jadis developers';
  }
}

HelloWorld.register();
```

And use it in your HTML:

```html
<hello-world></hello-world>
```

## CDN Usage

You can also use Jadis directly from a CDN like [esm.sh](https://esm.sh/@jadis/core@0.12.2):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jadis Example</title>
  </head>
  <body>
    <hello-world></hello-world>
    <script type="importmap">
      {
        "imports": {
          "jadis": "https://esm.sh/@jadis/core@0.12.2"
        }
      }
    </script>
    <script type="module">
      import { Jadis, createSelector, html } from 'jadis';

      class HelloWorld extends Jadis {
        static selector = createSelector('hello-world');

        templateHtml() {
          return html`<p>Hello, <span id="name"></span></p>`;
        }

        onConnect() {
          this.getElement('#name').textContent = 'Jadis developers';
        }
      }

      HelloWorld.register();
    </script>
  </body>
</html>
```

## Requirements

- A modern browser that supports [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) and [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- Node.js 18+ (for npm-based projects)
- No build tools required

:::tip Tip
Jadis works best with a module bundler like Vite, Rollup, or esbuild — but it is not required. The CDN approach above works for quick prototypes and simple projects.
:::
