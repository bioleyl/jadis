import { Jadis } from '@jadis/core';

/** Any path no other route matches: the server answers it with a 404 (src/entry-server.ts). */
export default class NotFoundPage extends Jadis {
  static readonly selector = 'not-found-page';

  templateHtml(): Node {
    return (
      <main style="max-width: 720px; margin: 4rem auto; padding: 0 1.5rem">
        <h1>Nothing here</h1>
        <p>
          This address leads nowhere. <a href="/">See the planets</a>.
        </p>
      </main>
    );
  }
}

NotFoundPage.register();
