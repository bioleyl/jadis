import HelloPage from './pages/hello/hello';
import MainPage from './pages/main/main-page';

export const loadRoutes = (router) => {
  router.addRoute('/', MainPage.selector, 'main');
  router.addRoute('/hello/:name', HelloPage.selector, 'hello');
};
