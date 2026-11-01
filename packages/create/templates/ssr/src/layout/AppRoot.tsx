import { css, Jadis } from '@jadis/core';

/** The frame of the pages: the header, and the page, its child, shown through the slot. */
export default class AppRoot extends Jadis {
  static readonly selector = 'app-root';

  templateHtml(): Node {
    return (
      <>
        <header>
          <a href="/">🪐 Planets</a>
          <span>Rendered on the server, then taken over by Jadis</span>
        </header>
        <main>
          <slot />
        </main>
      </>
    );
  }

  templateCss(): string {
    return css`
      :host {
        display: block;
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #2a2c4a;
      }
      a {
        color: inherit;
        font-weight: 700;
        text-decoration: none;
      }
      span {
        color: #8f92b8;
        font-size: 0.85rem;
      }
      main {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }
    `;
  }
}

AppRoot.register();
