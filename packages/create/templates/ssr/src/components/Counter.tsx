import { css, Jadis } from '@jadis/core';

/**
 * A counter. The server draws it with its `count`; once its code has loaded in the browser, the button counts. Bound
 * to an attribute, the count the server gave it comes with it.
 */
export default class Counter extends Jadis {
  static readonly selector = 'counter-component';

  readonly count = this.useChange(0, (value) => {
    this._refs.count.textContent = value.toString();
  }, { attribute: 'count' });

  private readonly _refs = this.useRefs((ref) => ({
    button: ref('button'),
    count: ref('span'),
  }));

  templateHtml(): Node {
    return (
      <p>
        <slot />: <span /> <button type="button">+1</button>
      </p>
    );
  }

  templateCss(): string {
    return css`
      button {
        margin-left: 0.5rem;
        padding: 0.25rem 0.75rem;
        border: 1px solid #4b4f86;
        border-radius: 6px;
        background: #1b1d38;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
    `;
  }

  onConnect(): void {
    this.on(this._refs.button, 'click', () => this.count.set((value) => value + 1));
  }
}

Counter.register();
