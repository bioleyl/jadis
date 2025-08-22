import { createSelector, css, html, Jadis } from '@jadis/core';

import { myRouter } from '../../router';

class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

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
    this.spanElement.textContent = this.getAttribute('name');

    this.on(this.buttonElement, 'click', () => this.#onButtonClick());
  }

  #onButtonClick() {
    myRouter.gotoName('main');
  }

  /** @returns {HtmlButtonElement} */
  get buttonElement() {
    return this.getElement('button');
  }

  /** @returns {HTMLSpanElement} */
  get spanElement() {
    return this.getElement('span');
  }
}

HelloPage.register();

export default HelloPage;
