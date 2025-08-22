import { css, html, Jadis } from '@jadis/core';

import { myRouter } from '../../router';

class HelloPage extends Jadis {
  static readonly selector = 'hello-page';

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
    this.spanElement.textContent = this.getAttribute('name') ?? '';

    this.on(this.buttonElement, 'click', () => this.#onButtonClick());
  }

  #onButtonClick(): void {
    myRouter.gotoName('main');
  }

  get buttonElement(): HTMLButtonElement {
    return this.getElement('button');
  }

  get spanElement(): HTMLSpanElement {
    return this.getElement('span');
  }
}

HelloPage.register();

export default HelloPage;
