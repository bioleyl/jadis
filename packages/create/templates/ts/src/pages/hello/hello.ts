import { css, html, Jadis } from '@jadis/core';
import { myRouter } from '../../router';

const template = html`
  <h1>Hello, <span></span>!</h1>
  <p>Welcome to the Hello Page.</p>
  <p>Click the button to go back to the main page.</p>
  <button>Go Back</button>
`;

const style = css`
  h1 {
    color: blue;
  }
`;
class HelloPage extends Jadis {
  static readonly selector = 'hello-page';
  static readonly template = template;
  static readonly style = style;

  onConnect(): void {
    this.spanElement.textContent = decodeURI(this.getAttribute('name') ?? '');

    this.on(this.buttonElement, 'click', () => this.#onButtonClick());
  }

  #onButtonClick() {
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
