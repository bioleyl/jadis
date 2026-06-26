# Route Groups

Route groups organize related routes under a shared URL prefix, reducing repetition and improving maintainability.

## Defining a Route Group

Use `defineRouteGroup()` to group routes under a common prefix:

```typescript
import { defineRouteGroup, defineRoutes, Router } from '@jadis/core';

const routes = defineRoutes({
  admin: defineRouteGroup('/admin', {
    dashboard: { path: '/dashboard', page: AdminDashboard },
    users:     { path: '/users', page: UserList },
    settings:  { path: '/settings', page: AdminSettings },
  }),
});

const router = new Router(routes);
router.mountOn(document.getElementById('app'));
```

This creates the following routes:

| Route Key | Path | Component |
|---|---|---|
| `adminDashboard` | `/admin/dashboard` | `AdminDashboard` |
| `adminUsers` | `/admin/users` | `UserList` |
| `adminSettings` | `/admin/settings` | `AdminSettings` |

Route keys are formed by camelCase-concatenating the group name with the route key.

## Shared Options

Apply common options to all routes in a group:

```typescript
const routes = defineRoutes({
  protected: defineRouteGroup('/protected', {
    profile: { path: '/profile', page: ProfilePage },
    edit:    { path: '/edit', page: EditPage },
  }, { rootComponentSelector: 'auth-layout' }),
});
```

All routes in the group will be wrapped in `<auth-layout>`.

## Nested Groups

Groups can be nested for deeply structured routing:

```typescript
const routes = define.defineRoutes({
  api: defineRouteGroup('/api', {
    v1: defineRouteGroup('/v1', {
      users:  { path: '/users', page: ApiUsers },
      posts:  { path: '/posts', page: ApiPosts },
    }),
    v2: defineRouteGroup('/v2', {
      users:  { path: '/users', page: ApiV2Users },
      posts:  { path: '/posts', page: ApiV2Posts },
    }),
  }),
});
```

Resulting routes:

| Route Key | Path |
|---|---|
| `apiV1Users` | `/api/v1/users` |
| `apiV1Posts` | `/api/v1/posts` |
| `apiV2Users` | `/api/v2/users` |
| `apiV2Posts` | `/api/v2/posts` |

## Navigation with Groups

Navigate using the generated route key:

```typescript
router.goto('adminDashboard');
router.goto('apiV1Users');
```

## Best Practices

- Use route groups for feature modules (e.g., `/admin`, `/api`, `/dashboard`).
- Keep group nesting to 2–3 levels deep for readability.
- Combine with shared `rootComponentSelector` for consistent layouts per module.

## See Also

- [Declaring Routes](./routes.md) — Individual route definitions.
- [Router API Reference](../api/router-class.md) — Router methods and options.
