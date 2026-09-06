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
}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `currentRoute` | `Route` | The currently matched route (`name`, `path`, and `componentSelector`). Throws if no route has been matched yet. |

## Methods

### `mountOn(element)`

Mounts the router to a DOM element. Route components are rendered inside this element.

```typescript
router.mountOn(document.getElementById('app'));
```

| Parameter | Type | Description |
|---|---|---|
| `element` | `HTMLElement` | The container element for route rendering |

### `goto(routeKey, params?)`

Navigates to a route by its key.

```typescript
router.goto('home');
router.goto('user', { id: '42' });
```

| Parameter | Type | Description |
|---|---|---|
| `routeKey` | `string` | The route key defined in the routes map |
| `params` | `Record<string, string>` | Optional dynamic parameter values |

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
router.mountOn(document.getElementById('app'));

// Navigate programmatically
router.goto('home');
router.goto('adminUsers');
```

## See Also

- [Routing Overview](../routing/overview.md) — Getting started with routing.
- [Declaring Routes](../routing/routes.md) — Route definitions and navigation.
- [Route Groups](../routing/route-groups.md) — Organizing routes.
