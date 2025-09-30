# 🧭 Declaring Routes

You can add routes individually or organize them into a route group when parts of your app share a common URL prefix.

## ➕ Add Individual Routes

Routes support dynamic parameters (e.g. `:name`), which are passed as attributes to the corresponding component.

```javascript
import { Jadis, html, createSelector, Router } from '@jadis/core';

class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

  templateHtml() {
    return html`<h1>Hello, <span id="name"></span>!</h1>`;
  }

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

Navigating to `/hello/john`, the router will render:

```html
<body>
  <div id="app">
    <hello-page name="john"></hello-page>
  </div>
</body>
```
## 🏷 Use Named Routes

You can assign a **name** to a route and navigate to it by name instead of hardcoding the URL. This is especially useful when working with dynamic parameters.

```javascript
const myRouter = new Router();

myRouter.addRoute('/invoice/:id', InvoicePage.selector, { name: 'inv' });
myRouter.mountOn(document.getElementById('app'));

myRoute.gotoName('inv', { id: 'abcd' })
```

This will navigate `/invoice/abcd`

## 🏗 Use a Root Component

You can specify a root component (for example, a layout or wrapper) into which the route component will be injected. This is useful for shared layouts, navigation bars, or page wrappers.

```javascript
const myRouter = new Router();

myRouter.addRoute('/hello/:name', HelloPage.selector, {
  rootComponentSelector: 'layout-component'
});

myRouter.mountOn(document.getElementById('app'));
```

Navigating to `/hello/john`, the router will render:

```html
<body>
  <div id="app">
    <layout-component name="john">
      <hello-page name="john"></hello-page>
    </layout-component>
  </div>
</body>
```