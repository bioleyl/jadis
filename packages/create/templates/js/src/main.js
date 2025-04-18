import { Router } from '@jadis/core';
import { loadRoutes } from './router';

export const myRouter = new Router();
loadRoutes(myRouter);
myRouter.mountOn(document.getElementById('app'));
