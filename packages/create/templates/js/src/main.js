import HelloPage from './pages/hello/hello';
import MainPage from './pages/main/main-page';
import { myRouter } from './router';

myRouter.addRoute('/', MainPage.selector, 'main');
myRouter.addRoute('/hello/:name', HelloPage.selector, 'hello');
myRouter.mountOn(document.getElementById('app'));
