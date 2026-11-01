import { css, Jadis } from '@jadis/core';

import { browserApi } from '../../api';
import { jsonOf } from '../../attributes';
import Counter from '../../components/Counter';

import type { ActiveRoute, RoutedPage } from '@jadis/core';
import type { Api, LoadingPage } from '../../types/api.types';
import type { PlanetSummary } from '../../types/planet.types';

/**
 * The planets. Their list is bound to the `data` attribute: the server loads it before the render (`load`) and writes
 * it in the markup, and the page upgrades in the browser with it. After a navigation in the browser, the page is new
 * and loads it itself (`onRoute`).
 */
export default class HomePage extends Jadis implements RoutedPage, LoadingPage {
  static readonly selector = 'home-page';

  readonly data = this.useChange<PlanetSummary[] | null>(null, (planets) => this.draw(planets), {
    attribute: 'data',
    parse: jsonOf<PlanetSummary[] | null>(null),
  });

  private readonly _refs = this.useRefs((ref) => ({ list: ref('ul') }));

  async load(_route: ActiveRoute, api: Api): Promise<void> {
    this.data.set(await api.planets());
  }

  onRoute(route: ActiveRoute): void {
    // The server's data is already here; a page made by the router loads its own.
    if (this.data.get() !== null) {
      return;
    }
    void this.load(route, browserApi);
  }

  templateHtml(): Node {
    return (
      <>
        <h1>The planets</h1>
        <p>This page arrived as HTML: turn JavaScript off, it still shows. The links open a planet without a page load.</p>
        <ul />
        <Counter count={8}>Planets counted so far</Counter>
      </>
    );
  }

  templateCss(): string {
    return css`
      ul {
        display: grid;
        gap: 0.5rem;
        padding: 0;
        list-style: none;
      }
      a {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border: 1px solid #2a2c4a;
        border-radius: 8px;
        color: inherit;
        text-decoration: none;
      }
      a:hover {
        border-color: #9ab4ff;
      }
      small {
        color: #8f92b8;
      }
    `;
  }

  private draw(planets: PlanetSummary[] | null): void {
    if (planets === null) {
      return;
    }
    this._refs.list.replaceChildren(
      ...planets.map((planet) => (
        <li>
          <a href={`/planets/${planet.id}`}>
            {planet.name} <small>{planet.kind}</small>
          </a>
        </li>
      ))
    );
  }
}

HomePage.register();
