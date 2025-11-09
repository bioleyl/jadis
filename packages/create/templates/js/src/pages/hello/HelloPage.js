import { createSelector, css, html, Jadis } from '@jadis/core';

import { myRouter } from '../../router';

class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

  refs = this.useRefs((ref) => ({
    button: ref('button'),
    name: ref('span'),
  }));

  templateHtml() {
    return html`
      <h1>Hello, <span></span>!</h1>
      <p>Welcome to the Hello Page.</p>
      <p>Click the button to go back to the main page.</p>
      <button>Go Back</button>
    `;
  }

  templateCss() {
    return css`
      h1 {
        color: blue;
      }
    `;
  }

  onConnect() {
    const { name, button } = this.refs;

    name.textContent = this.getAttribute('name');
    this.on(button, 'click', () => this.#onButtonClick());
  }

  #onButtonClick() {
    myRouter.gotoName('main');
  }
}

HelloPage.register();

export default HelloPage;
