import { defineRouteGroup, defineRoutes } from '@jadis/core';

import AppRoot from './layout/AppRoot';
import HomePage from './pages/home/HomePage';
import NotFoundPage from './pages/not-found/NotFoundPage';
import PlanetPage from './pages/planet/PlanetPage';

/**
 * The app's one route table: the browser's router follows it (src/entry-client.ts), the server renders from it
 * (src/entry-server.ts). The first route that matches wins: the catch-all comes last.
 */
export const routes = defineRoutes({
  ...defineRouteGroup(
    '/',
    {
      home: { page: HomePage, path: '/' },
      planet: { page: PlanetPage, path: '/planets/:id' },
    },
    { rootComponentSelector: AppRoot.selector }
  ),
  notFound: { page: NotFoundPage, path: '/:rest' },
});

export type RouteName = keyof typeof routes;
