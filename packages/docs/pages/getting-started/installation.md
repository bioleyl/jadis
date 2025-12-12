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
```

Then create a file named `index.js` with the following content:

```javascript
import { Jadis, createSelector, html } from '@jadis/core';

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
```

Then in your HTML:

```html
<hello-world></hello-world>
```

## Using a CDN

You can also use *Jadis* directly from a CDN like [unpkg](https://unpkg.com/@jadis/core/dist/umd/index.js) or [esm](https://esm.sh/@jadis/core@0.10.0):

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
          "jadis": "https://esm.sh/@jadis/core@0.10.0"
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
