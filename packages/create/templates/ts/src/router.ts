import HelloPage from './pages/hello/hello';
import MainPage from './pages/main/main-page';
import type { Router } from '@jadis/core';

export const loadRoutes = (router: Router) => {
  router.addRoute('/', MainPage.selector, 'main');
  router.addRoute('/hello/:name', HelloPage.selector, 'hello');
};
