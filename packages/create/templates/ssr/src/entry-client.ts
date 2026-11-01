// The browser's side of the app: the router takes over the page the server rendered in #app, then shows every next
// page itself. Links to the app's routes are followed without loading a page (`links: true`).
import { Router } from '@jadis/core';

import { routes } from './routes';

const app = document.getElementById('app');
if (app) {
  new Router(routes, { links: true }).mountOn(app);
}
