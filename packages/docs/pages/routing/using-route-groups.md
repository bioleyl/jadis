# 🗂 Using Route Groups

If many of your routes share a common prefix or a common layout and you don’t want to repeat yourself, you can group them together.

## 📦 Add Routes by Group

Grouping routes under a shared prefix makes organization easier and keeps URLs clean. Use `RouteGroup` to create and register grouped routes:

```javascript
import { RouteGroup, Router } from '@jadis/core';

const myGroup = RouteGroup.create('common-prefix')
  .addRoute('/route-a', 'route-a-component', { name: 'RouteA' })
  .addRoute('/route-b', 'route-b-component', { name: 'RouteB' })
  .addRoute('/route-c', 'route-c-component', { name: 'RouteC' });

const myRouter = new Router();

myRouter.addGroup(myGroup);

myRouter.mountOn(document.body);
```

This setup will result in routes like:

- `/common-prefix/route-a` → name `RouteA`
- `/common-prefix/route-b` → name `RouteB`
- `/common-prefix/route-c` → name `RouteC`

You can also add a **name prefix** to group routes logically:

```javascript
const myGroup = RouteGroup.create('common-prefix', { name: 'ModuleName' })
  .addRoute('/route-a', 'route-a-component', { name: 'RouteA' })
  .addRoute('/route-b', 'route-b-component', { name: 'RouteB' })
  .addRoute('/route-c', 'route-c-component', { name: 'RouteC' });
```

Resulting names:

- `/common-prefix/route-a` → `ModuleNameRouteA`
- `/common-prefix/route-b` → `ModuleNameRouteB`
- `/common-prefix/route-c` → `ModuleNameRouteC`

## 📝 Note on Nested Route Groups

You can also nest a RouteGroup inside another RouteGroup, which helps when organizing modules or features with deeply structured paths. This is ideal for applications with layered routing logic.

```javascript
const subGroup = RouteGroup.create('sub-section')
  .addRoute('/item-a', 'item-a-component', { name: 'ItemA' })
  .addRoute('/item-b', 'item-b-component', { name: 'ItemB' });

const mainGroup = RouteGroup.create('main-section')
  .addGroup(subGroup)
  .addRoute('/overview', 'overview-component', { name: 'Overview' });

const router = new Router();
router.addGroup(mainGroup);
router.mountOn(document.body);
```

This would result in:

- `/main-section/sub-section/item-a` → `ItemA`
- `/main-section/sub-section/item-b` → `ItemB`
- `/main-section/overview` → `Overview`

📌 Tip: When nesting groups, keep your route names consistent and concise to avoid confusion or use a name prefix on your groups.

## 🏗 Using a Root Component in a Group

When you define a root component at the group level, all routes in that group will be wrapped with the specified component. This is useful for applying a shared layout across multiple pages.

```javascript
const mainGroup = RouteGroup.create('main-section', { 
  rootComponentSelector: 'main-component'
}).addRoute('/overview', 'overview-component');
```

Going to `/main-section/overview` will render:

```html
<main-component>
    <overview-component></overview-component>
</main-component>
```
