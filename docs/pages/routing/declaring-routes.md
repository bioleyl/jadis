# 🧭 Declaring Routes

You can add routes individually or organize them into a route group when parts of your app share a common URL prefix.

## ➕ Add Individual Routes

Routes support dynamic parameters (e.g. `:name`), which are passed as attributes to the corresponding component.

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

Navigating to `/hello/john`, the router will render:

```html
<body>
  <div id="app">
    <hello-page name="john"></hello-page>
  </div>
</body>
```

## 📦 Add Routes by Group

Grouping routes under a shared prefix makes organization easier and keeps URLs clean. Use RouteGroup to create and register grouped routes:

```javascript
import { RouteGroup, Router } from '@jadis/core';

const myGroup = RouteGroup.create('common-prefix')
  .addRoute('/route-a', 'route-a-component', 'RouteA')
  .addRoute('/route-b', 'route-b-component', 'RouteB')
  .addRoute('/route-c', 'route-c-component', 'RouteC');

const myRouter = new Router();

myRouter.addGroup(myGroup);

myRouter.mountOn(document.body);
```

This setup will result in routes like:

- `/common-prefix/route-a` → name `RouteA`
- `/common-prefix/route-b` → name `RouteB`
- `/common-prefix/route-c` → name `RouteC`

You can also add a name prefix to group routes logically:

```javascript
const myGroup = RouteGroup.create('common-prefix', 'ModuleName')
  .addRoute('/route-a', 'route-a-component', 'RouteA')
  .addRoute('/route-b', 'route-b-component', 'RouteB')
  .addRoute('/route-c', 'route-c-component', 'RouteC');
```

Resulting names:

- `/common-prefix/route-a` → `ModuleNameRouteA`
- `/common-prefix/route-b` → `ModuleNameRouteB`
- `/common-prefix/route-c` → `ModuleNameRouteC`

## 📝 Note on Nested Route Groups

You can also nest a RouteGroup inside another RouteGroup, which helps when organizing modules or features with deeply structured paths. This is ideal for applications with layered routing logic.

```javascript
const subGroup = RouteGroup.create('sub-section')
  .addRoute('/item-a', 'item-a-component', 'ItemA')
  .addRoute('/item-b', 'item-b-component', 'ItemB');

const mainGroup = RouteGroup.create('main-section')
  .addGroup(subGroup)
  .addRoute('/overview', 'overview-component', 'Overview');

const router = new Router();
router.addGroup(mainGroup);
router.mountOn(document.body);
```

This would result in:

- `/main-section/sub-section/item-a` → `ItemA`
- `/main-section/sub-section/item-b` → `ItemB`
- `/main-section/overview` → `Overview`

📌 Tip: When nesting groups, keep your route names consistent and concise to avoid confusion or use a name prefix on your groups.
