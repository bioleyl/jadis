import { css, Jadis } from '@jadis/core';

import { browserApi } from '../../api';
import { jsonOf } from '../../attributes';

import type { ActiveRoute, RoutedPage } from '@jadis/core';
import type { Api, LoadingPage } from '../../types/api.types';
import type { PlanetView } from '../../types/planet.types';

const STATUS = { notFound: 404, ok: 200 } as const;

/**
 * One planet: `/planets/:id`. The server answers 404 for a planet that does not exist (`httpStatus`) and titles the
 * page after the planet (`pageTitle`).
 */
export default class PlanetPage extends Jadis implements RoutedPage, LoadingPage {
  static readonly selector = 'planet-page';

  readonly data = this.useChange<PlanetView | null>(null, (view) => this.draw(view), {
    attribute: 'data',
    parse: jsonOf<PlanetView | null>(null),
  });

  private readonly _refs = this.useRefs((ref) => ({
    description: ref('.description'),
    facts: ref('.facts'),
    title: ref('h1'),
  }));

  async load(route: ActiveRoute, api: Api): Promise<void> {
    const id = route.params.id ?? '';
    const planet = await api.planet(id);
    this.data.set(planet ? { found: true, planet } : { found: false, id });
  }

  onRoute(route: ActiveRoute): void {
    const view = this.data.get();
    const shown = view?.found ? view.planet.id : view?.id;
    if (shown === route.params.id) {
      return;
    }
    void this.load(route, browserApi);
  }

  httpStatus(): number {
    return this.data.get()?.found === false ? STATUS.notFound : STATUS.ok;
  }

  pageTitle(): string {
    const view = this.data.get();
    return view?.found ? view.planet.name : 'No such planet';
  }

  templateHtml(): Node {
    return (
      <>
        <a href="/">← All planets</a>
        <h1 />
        <p class="description" />
        <dl class="facts" />
      </>
    );
  }

  templateCss(): string {
    return css`
      dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.25rem 1.5rem;
      }
      dt {
        color: #8f92b8;
      }
      dd {
        margin: 0;
      }
    `;
  }

  private draw(view: PlanetView | null): void {
    if (view === null) {
      return;
    }
    if (!view.found) {
      this._refs.title.textContent = 'No such planet';
      this._refs.description.textContent = `There is no planet called “${view.id}”.`;
      this._refs.facts.replaceChildren();
      return;
    }
    const { planet } = view;
    this._refs.title.textContent = planet.name;
    this._refs.description.textContent = planet.description;
    this._refs.facts.replaceChildren(
      <dt>Kind</dt>,
      <dd>{planet.kind}</dd>,
      <dt>Moons</dt>,
      <dd>{planet.moons}</dd>,
      <dt>From the Sun</dt>,
      <dd>{planet.distance} AU</dd>
    );
  }
}

PlanetPage.register();
