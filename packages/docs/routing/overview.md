# Overview

Jadis includes a built-in, lightweight router for component-based navigation. It is designed to be simple yet powerful enough for single-page applications with dynamic routes, route groups, and shared layouts.

## Key Concepts

| Concept | Description |
|---|---|
| **Route** | A mapping between a URL path and a Jadis component (the "page"). |
| **Route Group** | A collection of routes sharing a common prefix and optional shared layout. |
| **Navigation** | Changing the current route via `router.goto()`. |
| **Mount Point** | The DOM element where route components are rendered. |

## Quick Start

```typescript
import { Router, defineRoutes } from '@jadis/core';

const routes = defineRoutes({
  home:   { path: '/', page: HomePage },
  about:  { path: '/about', page: AboutPage },
});

const router = new Router(routes);
router.mountOn(document.getElementById('app'));
```

## Navigation Modes

The router supports two modes:

| Mode | URL Format | Use Case |
|---|---|---|
| **`hash`** (default) | `/#/about` | Simple deployments, no server config needed |
| **`history`** | `/about` | Clean URLs, requires server-side fallback |

```typescript
const router = new Router(routes, { mode: 'history' });
```

## Base URL

If your app is hosted in a subdirectory, specify the `baseUrl`:

```typescript
const router = new Router(routes, { baseUrl: 'my-app' });
// Routes resolve relative to /my-app/
```

## Route Parameters

Dynamic segments (`:param`) are passed as attributes to the page component:

```typescript
const routes = defineRoutes({
  user: { path: '/user/:id', page: UserPage },
});
```

Navigating to `/user/42` renders `<user-page id="42"></user-page>`.

## Root Components

Routes can specify a `rootComponentSelector` for shared layouts:

```typescript
const routes = defineRoutes({
  home: {
    path: '/',
    page: HomePage,
    options: { rootComponentSelector: 'app-layout' },
  },
});
```

This wraps the page component inside the specified layout component.

## See Also

- [Declaring Routes](./routes.md) — Route definitions and navigation.
- [Route Groups](./route-groups.md) — Organizing routes with shared prefixes.
- [Router API Reference](../api/router-class.md) — Complete API documentation.
