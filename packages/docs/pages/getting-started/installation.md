# Installation

*Jadis* is flexible and easy to get started with, whether you prefer a boilerplate setup, manual installation via npm, or embedding via CDN. It provides **full type support for both TypeScript and JSDoc**, allowing you to describe component behavior with precision and confidence. Even in plain JavaScript, *Jadis* offers **partial typing** through primitive constructors, giving you a lightweight way to improve clarity and reduce bugs.

## Using a boilerplate

The easiest way to start a project is with a pre-made boilerplate.

- **JS Boilerplate**
- **TS Boilerplate**

Create a new project using:

::: code-group

```bash [JS Boilerplate]
npx @jadis/create js my-project
```

```bash [TS Boilerplate]
npx @jadis/create ts my-project
```

:::

## Installing from NPM

You can also start from scratch using the official *Jadis* package:

```bash
npm install @jadis/core
npm install --save-dev typescript vite
```

For a JSX project, create a file named `src/main.tsx` (or `src/main.jsx` for JavaScript) with the following content:

```tsx
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

JSX must be transformed by TypeScript or a JavaScript bundler before the browser can run it. The boilerplate templates include the required Vite and JSX configuration.

Then in your HTML:

```html
<hello-world></hello-world>
```

## Using a CDN

You can also use *Jadis* directly from a CDN like [esm](https://esm.sh/@jadis/core@1.0.0). This example uses DOM APIs directly so it can run without a JSX transform:

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
          "jadis": "https://esm.sh/@jadis/core@1.0.0"
        }
      }
    </script>
    <script type="module">
      import { createElement, Jadis } from 'jadis';

      class HelloWorld extends Jadis {
        static selector = 'hello-world';

        templateHtml() {
          const paragraph = createElement('p');
          paragraph.textContent = 'Hello, Jadis developers';
          return paragraph;
        }
      }

      HelloWorld.register();
    </script>
  </body>
</html>
```
