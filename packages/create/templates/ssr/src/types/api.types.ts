import type { ActiveRoute } from '@jadis/core';
import type { Planet, PlanetSummary } from './planet.types';

/** The app's API, the same in the browser and in a server render. */
export interface Api {
  planets(): Promise<PlanetSummary[]>;
  planet(id: string): Promise<Planet | undefined>;
}

/**
 * A page that loads what it shows: on the server before the render, in the browser after a navigation. Once loaded,
 * it can give the response's status and the page's title.
 */
export interface LoadingPage {
  load(route: ActiveRoute, api: Api): Promise<void>;
  httpStatus?(): number;
  pageTitle?(): string;
}
