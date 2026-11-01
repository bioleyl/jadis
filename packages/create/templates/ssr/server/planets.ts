// The app's records, as a database would hold them: only the server reads them, the pages get them from the API.
import type { Planet } from '../src/types/planet.types.ts';

export const PLANETS: Planet[] = [
  {
    description: 'The smallest planet, and the closest to the Sun.',
    distance: 0.39,
    id: 'mercury',
    kind: 'Terrestrial',
    moons: 0,
    name: 'Mercury',
  },
  {
    description: 'Wrapped in thick clouds of sulphuric acid, the hottest planet.',
    distance: 0.72,
    id: 'venus',
    kind: 'Terrestrial',
    moons: 0,
    name: 'Venus',
  },
  {
    description: 'The only planet known to hold life.',
    distance: 1,
    id: 'earth',
    kind: 'Terrestrial',
    moons: 1,
    name: 'Earth',
  },
  {
    description: 'A cold desert, red with iron oxide.',
    distance: 1.52,
    id: 'mars',
    kind: 'Terrestrial',
    moons: 2,
    name: 'Mars',
  },
  {
    description: 'The largest planet, with a storm larger than the Earth.',
    distance: 5.2,
    id: 'jupiter',
    kind: 'Gas giant',
    moons: 95,
    name: 'Jupiter',
  },
  {
    description: 'Known for its rings of ice and rock.',
    distance: 9.58,
    id: 'saturn',
    kind: 'Gas giant',
    moons: 146,
    name: 'Saturn',
  },
  {
    description: 'It spins on its side.',
    distance: 19.2,
    id: 'uranus',
    kind: 'Ice giant',
    moons: 28,
    name: 'Uranus',
  },
  {
    description: 'The windiest planet, and the farthest from the Sun.',
    distance: 30.05,
    id: 'neptune',
    kind: 'Ice giant',
    moons: 16,
    name: 'Neptune',
  },
];
