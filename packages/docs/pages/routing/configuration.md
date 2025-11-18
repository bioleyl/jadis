# Router Configuration

*Jadis* comes with a built-in router designed to be lightweight and straightforward. While simple by design, it already covers the essentials: defining routes, handling parameters, and rendering components as view pages.

Routing in *Jadis* is **component-based**: each route corresponds to a registered *Jadis* component, making navigation feel intuitive and declarative.

To use the router, 3 simple steps:

1. Instantiate the router
2. Define your routes
3. Mount it to a DOM element

When creating a router instance, you can configure several options to control its behavior and navigation mode.

## Router Mode

The router supports two navigation modes:

- **Hash mode**: Uses URL fragments (e.g. `/#/home`) for navigation. The browser stays on the same base URL and appends routes after a `#`.
- **History mode**: Utilizes the browser’s history API for clean URLs and proper back/forward navigation (e.g. `/home`).

## Example

```typescript
import { Router, RouterOptions } from '@jadis/core';

const routerOptions: RouterOptions = {
  mode: 'hash', // Use 'history' for clean URLs
};

export const myRouter = new Router(routerOptions);
```

Choose the mode that best fits your application's requirements and hosting setup.

## Base URL

If your application is hosted in a subdirectory of your domain (e.g. `https://my-website.com/my-app`), you should set the `baseUrl` option to ensure routes resolve correctly. Otherwise, routing will assume your app is at the domain root.

```typescript
import { Router, RouterOptions } from '@jadis/core';

const routerOptions: RouterOptions = {
  baseUrl: 'my-app',
};

export const myRouter = new Router(routerOptions);
```

This prevents incorrect route resolution and enables consistent behavior regardless of deployment location.
