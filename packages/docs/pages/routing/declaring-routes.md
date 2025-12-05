# Declaring Routes

You can add routes individually or organize them into a route group when parts of your app share a common URL prefix.  
[See the dedicated documentation](using-route-groups.md) about route groups.

## Add Individual Routes

Routes support dynamic parameters (e.g. `:name`), which are passed as attributes to the corresponding component.

```javascript
import { Jadis, html, createSelector, Router, defineRoutes } from '@jadis/core';

class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

  refs = this.useRefs((ref) => ({
    name: ref('#name'),
  }));

  templateHtml() {
    return html`<h1>Hello, <span id="name"></span>!</h1>`;
  }

  onConnect() {
    const name = this.getAttribute('name');
    this.refs.name.textContent = name || 'Guest';
  }
}

HelloPage.register();

const routes = defineRoutes({
  hello: { path: '/hello/:name', page: HelloPage },
});

const myRouter = new Router(routes);

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

## Navigation

You can navigate to any defined route by using the name used as the key. If the route has parameters, you can pass them as the second argument of the `goto` method.

```javascript
const routes = defineRoutes({
  inv: { path: '/invoice/:id', page: InvoicePage },
});

const myRouter = new Router(routes);

myRouter.mountOn(document.getElementById('app'));

myRouter.goto('inv', { id: 'abcd' })
```

This will navigate `/invoice/abcd`

## Use a Root Component

You can specify a root component (for example, a layout or wrapper) into which the route component will be injected. This is useful for shared layouts, navigation bars, or page wrappers.

```javascript
const routes = defineRoutes({
  hello: {
    path: '/hello/:name',
    page: HelloPage,
    options: { rootComponentSelector: LayoutComponent.selector }
  },
})

const myRouter = new Router(routes);

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
