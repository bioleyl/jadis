# Using Route Groups

If many of your routes share a common prefix or a common layout and you don’t want to repeat yourself, you can group them together.

## Add Routes by Group

Grouping routes under a shared prefix makes organization easier and keeps URLs clean. Use `RouteGroup` to create and register grouped routes:

```javascript
import { defineRouteGroup, defineRoutes, Router } from '@jadis/core';

const routes = defineRoutes({
  group: defineRouteGroup('/common-prefix', {
    routeA: { path: '/route-a', page: RouteAPage },
    routeB: { path: '/route-b', page: RouteBPage },
    routeC: { path: '/route-c', page: RouteCPage },
  })
})

const myRouter = new Router(routes);

myRouter.mountOn(document.body);
```

This setup will result in routes like:

- `/common-prefix/route-a` → name `groupRouteA`
- `/common-prefix/route-b` → name `groupRouteB`
- `/common-prefix/route-c` → name `groupRouteC`

## Note on Nested Route Groups

You can also nest a route group inside another route group, which helps when organizing modules or features with deeply structured paths. This is ideal for applications with layered routing logic.

```javascript
import { defineRouteGroup, defineRoutes, Router } from "@jadis/core";

const routes = defineRoutes({
  mainSection: defineRouteGroup('/main-section', {
    subSection: defineRouteGroup('/sub-section', {
      itemA: { path: '/item-a', component: ItemAPage },
      itemB: { path: '/item-b', component: ItemBPage },
    }),
    overview: { path: '/overview', component: OverviewPage },
  }),
})

const router = new Router(routes);

router.mountOn(document.body);
```

This would result in:

- `/main-section/sub-section/item-a` → `mainSectionSubSectionItemA`
- `/main-section/sub-section/item-b` → `mainSectionSubSectionItemB`
- `/main-section/overview` → `mainSectionOverview`

## Using a Root Component in a Group

When you define a root component at the group level, all routes in that group will be wrapped with the specified component. This is useful for applying a shared layout across multiple pages.

```javascript
const routes = defineRoutes({
  mainSection: defineRouteGroup('/main-section', {
    overview: { path: '/overview', component: OverviewPage },
  }, { rootComponentSelector: 'main-component' }),
});
```

Going to `/main-section/overview` will render:

```html
<main-component>
  <overview-page></overview-page>
</main-component>
```
