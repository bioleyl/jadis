import { css, html, Jadis } from '@jadis/core';

import { myRouter } from '../../router';

export default class HelloPage extends Jadis {
  static readonly selector = 'hello-page';

  private readonly _refs = this.useRefs((ref) => ({
    button: ref('button'),
    name: ref('span'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <h1>Hello, <span></span>!</h1>
      <p>Welcome to the Hello Page.</p>
      <p>Click the button to go back to the main page.</p>
      <button>Go Back</button>
    `;
  }

  templateCss(): string {
    return css`
      h1 {
        color: blue;
      }
    `;
  }

  onConnect(): void {
    const { name, button } = this._refs;

    name.textContent = this.getAttribute('name') ?? '';
    this.on(button, 'click', () => this.onButtonClick());
  }

  private onButtonClick(): void {
    myRouter.goto('main');
  }
}

HelloPage.register();
