# Router Class

A lightweight, component-based router for Jadis applications. Supports hash and history modes, dynamic parameters, route groups, and root component wrapping.

## Import

```typescript
import { Router } from '@jadis/core';
```

## Constructor

```typescript
new Router(routes: RouteDefinitions, options?: RouterOptions);
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `routes` | `RouteDefinitions` | A route map created by `defineRoutes()` |
| `options` | `RouterOptions` | Optional configuration |

## RouterOptions

```typescript
interface RouterOptions {
  mode?: 'hash' | 'history';   // Navigation mode (default: 'history')
  baseUrl?: string;             // Base URL for subdirectory deployments
  signal?: AbortSignal;         // Stops following the URL once aborted
}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `currentRoute` | `ActiveRoute` | The currently matched route (`name`, `path`, `componentSelector`), with its `params` and its `query`. Throws if no route has been matched yet. |

## Methods

### `mountOn(element)`

Mounts the router to a DOM element. Route components are rendered inside this element.

```typescript
router.mountOn(document.getElementById('app') ?? document.body);
```

| Parameter | Type | Description |
|---|---|---|
| `element` | `HTMLElement` | The container element for route rendering |

### `goto(routeKey, params?)`

Navigates to a route by its key, unless the current page's `canLeave` refuses it.

```typescript
router.goto('home');
router.goto('user', { id: '42' });
```

| Parameter | Type | Description |
|---|---|---|
| `routeKey` | `string` | The route key defined in the routes map |
| `params` | `Record<string, string>` | The values of the path's parameters, by name: required when the path has some, refused otherwise |

Both are type-checked: `router.goto('user')` is an error when the path is `/user/:id`, and so is `router.goto('home', { id: '42' })` when it is `/`.

## Route Definition

Each route is defined as:

```typescript
interface RouteDefinition {
  path: string;                        // URL path pattern
  page: JadisConstructor;              // Component to render
  options?: RouteOptions;              // Optional route settings
}

interface RouteOptions {
  rootComponentSelector?: string;       // Selector for a wrapping component
}
```

## Dynamic Parameters

Use `:paramName` in paths:

```typescript
const routes = defineRoutes({
  user: { path: '/user/:id', page: UserPage },
});
```

Parameters are passed as attributes to the page component.

## Routed Pages

A page can declare `onRoute(route)`, to be kept while the routes stay on it, and `canLeave(next)`, to hold the person back:

```typescript
interface RoutedPage {
  onRoute?(route: ActiveRoute): void;
  canLeave?(next: ActiveRoute): boolean | Promise<boolean>; // LeaveAnswer
}
```

See [Routed Pages](../routing/routed-pages.md) for details.

## Route Groups

Use `defineRouteGroup()` to group routes under a common prefix:

```typescript
const routes = defineRoutes({
  admin: defineRouteGroup('/admin', {
    dashboard: { path: '/dashboard', page: AdminDashboard },
  }),
});
```

See [Route Groups](../routing/route-groups.md) for details.

## Full Example

```typescript
import { Router, defineRoutes, defineRouteGroup } from '@jadis/core';

const routes = defineRoutes({
  home:   { path: '/', page: HomePage },
  admin: defineRouteGroup('/admin', {
    dashboard: { path: '/dashboard', page: AdminDashboard },
    users:     { path: '/users', page: UserList },
  }),
});

const router = new Router(routes, { mode: 'history' });
router.mountOn(document.getElementById('app') ?? document.body);

// Navigate programmatically
router.goto('home');
router.goto('adminUsers');
```

## See Also

- [Routing Overview](../routing/overview.md) — Getting started with routing.
- [Declaring Routes](../routing/routes.md) — Route definitions and navigation.
- [Route Groups](../routing/route-groups.md) — Organizing routes.
- [Routed Pages](../routing/routed-pages.md) — Keeping a page between routes, and holding the person back.
