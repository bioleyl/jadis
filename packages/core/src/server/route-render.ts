import { createRouteElements } from '../helpers/router.helper';
import { Router } from '../router/router';
import { renderToHtml } from './server-render';

import type { ActiveRoute, RouteDefinition } from '../types/router.type';

type Routes = Record<string, RouteDefinition>;

export interface RouteRenderOptions {
  /**
   * Gives the route's page what it shows before the render: the app's loader, with the request's credentials. The
   * page is created, not yet connected; values set on its attribute-bound fields go out in the markup, so the page
   * upgrades in the browser with them.
   */
  prepare?: (page: HTMLElement, route: ActiveRoute) => Promise<void>;
}

export interface RenderedRoute {
  /** The route the path matched, with its parameters and its query. */
  route: ActiveRoute;
  /** The route's elements as HTML, from the group's root component down to the page. */
  body: string;
  /** The page element, as rendered: what it holds gives the response its status or its title. */
  page: HTMLElement;
}

// One router per route table, for its matching only: aborted from the start, it follows no URL and no link.
const matchers = new WeakMap<Routes, Router<Routes>>();

function matcherOf(routes: Routes): Router<Routes> {
  const known = matchers.get(routes);
  if (known) {
    return known;
  }
  const router = new Router(routes, { signal: AbortSignal.abort() });
  matchers.set(routes, router);
  return router;
}

/**
 * Renders the page of a path from the app's route table, the one its router uses in the browser: the same matching,
 * the same elements (the group's root component, then the page, the parameters as attributes). Put in the router's
 * mount point, the browser's router takes these elements over instead of making the page again.
 * @param routes The app's routes, as given to its `Router`
 * @param path The path asked, its query included, without the base URL
 * @param options How the page gets its data before the render
 * @returns The route and its HTML, or undefined when no route matches the path
 * @example
 * const rendered = await renderRoute(routes, request.url, {
 *   prepare: (page, route) => (page as OrdersPage).load(route, serverApi),
 * });
 */
export async function renderRoute(
  routes: Routes,
  path: string,
  options: RouteRenderOptions = {}
): Promise<RenderedRoute | undefined> {
  const route = matcherOf(routes).match(path);
  if (!route) {
    return undefined;
  }
  const elements = createRouteElements(route.componentSelector, route.params);
  const page = elements.at(-1) ?? elements[0];
  await options.prepare?.(page, route);
  return { body: await renderToHtml(elements[0]), page, route };
}
