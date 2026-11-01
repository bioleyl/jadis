export interface Planet {
  id: string;
  name: string;
  kind: string;
  moons: number;
  /** Its distance from the Sun, in astronomical units. */
  distance: number;
  description: string;
}

/** What the home page shows of a planet. */
export type PlanetSummary = Pick<Planet, 'id' | 'name' | 'kind'>;

/** What the planet page shows: the planet, or that there is none of that name. */
export type PlanetView = { found: true; planet: Planet } | { found: false; id: string };
