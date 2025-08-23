import HelloPage from './pages/hello/HelloPage';
import MainPage from './pages/main/MainPage';
import { myRouter } from './router';

myRouter.addRoute('/', MainPage.selector, 'main');
myRouter.addRoute('/hello/:name', HelloPage.selector, 'hello');
myRouter.mountOn(document.getElementById('app') ?? document.body);
