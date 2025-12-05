import { defineRoutes, Router } from '@jadis/core';

import HelloPage from './pages/hello/HelloPage';
import MainPage from './pages/main/MainPage';

const routes = defineRoutes({
  hello: { page: HelloPage, path: '/hello/:name' },
  main: { page: MainPage, path: '/' },
});

export const myRouter = new Router(routes);

myRouter.mountOn(document.getElementById('app') ?? document.body);
