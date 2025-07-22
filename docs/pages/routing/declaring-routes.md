# 🧭 How to Declare Routes

Jadis comes with a built-in router designed to be lightweight and straightforward — and it’s evolving. While simple by design, it already covers the essentials: defining routes, handling parameters, and rendering components as view pages.

Routing in Jadis is **component-based**: each route corresponds to a registered Jadis component, making navigation feel intuitive and declarative.

To use the router:

- Instantiate the router
- Define your routes
- Mount it to a DOM element

Routes can include dynamic parameters like `:name`, which will be passed as attributes directly to the component.

```javascript
import { Jadis, Router } from '@jadis/core';

class HelloPage extends Jadis {
  static selector = 'hello-page';
  static template = `<h1>Hello, <span id="name"></span>!</h1>`;

  onConnect() {
    const name = this.getAttribute('name');
    this.nameElement.textContent = name || 'Guest';
  }

  get nameElement() {
    return this.getElement('#name');
  }
}

HelloPage.register();

const myRouter = new Router();

myRouter.addRoute('/hello/:name', HelloPage.selector);

myRouter.mountOn(document.getElementById('app'));
```

When a user navigates to `/hello/john`, the router will render:

```html
<body>
  <div id="app">
    <hello-page name="john"></hello-page>
  </div>
</body>
```
