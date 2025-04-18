import { Jadis } from '@jadis/core';
import { myRouter } from '../../router';

class HelloPage extends Jadis {
  static selector = 'hello-page';
  static template = `
    <h1>Hello, <span></span>!</h1>
    <p>Welcome to the Hello Page.</p>
    <p>Click the button to go back to the main page.</p>
    <button>Go Back</button>
  `;
  static style = `
    h1 { color: blue; }
  `;

  onConnect() {
    this.spanElement.textContent = decodeURI(this.getAttribute('name'));

    this.listenOn(this.buttonElement)
      .when('click')
      .do(() => this.#onButtonClick());
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
