import type { ServerTools } from '@jadis/fastify';
import type { Api } from './types/api.types';
import type { Planet, PlanetSummary } from './types/planet.types';

const API_PLANETS = '/api/planets';
const STATUS_NOT_FOUND = 404;

/** The API over a way to send requests. */
function createApi(request: (path: string) => Promise<Response>): Api {
  return {
    planet: async (id) => {
      const response = await request(`${API_PLANETS}/${encodeURIComponent(id)}`);
      return response.status === STATUS_NOT_FOUND ? undefined : ((await response.json()) as Planet);
    },
    planets: async () => (await (await request(API_PLANETS)).json()) as PlanetSummary[],
  };
}

/** The API in the browser. */
export const browserApi = createApi((path) => fetch(path));

/** The API in a server render: Node's fetch, to the server itself. */
export const serverApi = (server: ServerTools): Api =>
  createApi((path) => server.fetch(`${server.origin}${path}`));
