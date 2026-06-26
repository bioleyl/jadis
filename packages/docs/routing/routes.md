# Declaring Routes

Routes map URL paths to Jadis components. Use `defineRoutes()` to create a route configuration object that the router consumes.

## Defining Routes

```typescript
import { defineRoutes, Router } from '@jadis/core';

const routes = defineRoutes({
  home:   { path: '/', page: HomePage },
  about:  { path: '/about', page: AboutPage },
  contact:{ path: '/contact', page: ContactPage },
});

const router = new Router(routes);
router.mountOn(document.getElementById('app'));
```

Each route is defined as an object with:

| Property | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | Yes | The URL path pattern |
| `page` | `JadisConstructor` | Yes | The component to render for this route |

## Dynamic Parameters

Use `:paramName` syntax for dynamic segments:

```typescript
const routes = defineRoutes({
  user: { path: '/user/:id', page: UserPage },
  post: { path: '/post/:slug', page: PostPage },
});
```

Parameters are passed as attributes to the page component:

```html
<!-- Navigating to /user/42 -->
<user-page id="42"></user-page>
```

Access them in your component:

```typescript
class UserPage extends Jadis {
  onConnect(): void {
    const userId = this.getAttribute('id');
    console.log(`Loading user ${userId}`);
  }
}
```

## Navigation

Use `router.goto()` to navigate programmatically:

```typescript
// Navigate to a route by its key
router.goto('home');

// Navigate with parameters
router.goto('user', { id: '42' });
// → /user/42
```

The second argument is an object mapping parameter names to values.

## Root Component per Route

Wrap specific routes in a shared layout component:

```typescript
const routes = defineRoutes({
  home: {
    path: '/',
    page: HomePage,
    options: { rootComponentSelector: 'app-layout' },
  },
  about: {
    path: '/about',
    page: AboutPage,
    options: { rootComponentSelector: 'app-layout' },
  },
});
```

Both routes will render inside `<app-layout>...</app-layout>`.

## Best Practices

- Use descriptive route keys (e.g., `userProfile` instead of `up`).
- Keep path segments short and readable.
- Group related routes using [Route Groups](./route-groups.md).
- Define the router as a module-level singleton to avoid recreation.

## See Also

- [Route Groups](./route-groups.md) — Organizing routes with shared prefixes.
- [Router API Reference](../api/router-class.md) — Complete method documentation.
