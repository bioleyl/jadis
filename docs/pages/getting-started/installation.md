# Installation

## Using a boilerplate

The easiest way to start a project is with a pre-made boilerplate.

::: code-group

```bash [JS Boilerplate]
npx @jadis/create js my-project
```

```bash [TS Boilerplate]
npx @jadis/create ts my-project
```
:::

## Installing from NPM

You can also start a project from scratch, using the NPM package.

```bash 
npm install @jadis/core
```

Then create a file `index.js` with the following content:

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

## Using a CDN

You can also use Jadis directly from a CDN, like [unpkg](https://unpkg.com/@jadis/core/dist/umd/index.js).

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jadis Example</title>
    <script src="https://unpkg.com/@jadis/core/dist/umd/index.js"></script>
  </head>
  <body>
    <hello-world></hello-world>
    <script>
    class HelloWorld extends Jadis.Jadis {
      static selector = 'hello-world';
      static template = '<p>Hello, <span id="name"></span></p>';

      onConnect() {
        this.getElement('#name').textContent = 'Jadis developers';
      }
    }
    HelloWorld.register();
    </script>
  </body>
</html>
```
