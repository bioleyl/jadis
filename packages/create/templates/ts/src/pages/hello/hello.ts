import { Jadis } from '@jadis/core';
import { myRouter } from '../../router';

class HelloPage extends Jadis {
  static readonly selector = 'hello-page';
  static readonly template = `
    <h1>Hello, <span></span>!</h1>
    <p>Welcome to the Hello Page.</p>
    <p>Click the button to go back to the main page.</p>
    <button>Go Back</button>
  `;
  static readonly style = `
    h1 { color: blue; }
  `;

  onConnect(): void {
    this.spanElement.textContent = decodeURI(this.getAttribute('name') ?? '');

    this.listenOn(this.buttonElement)
      .when('click')
      .do(() => this.#onButtonClick());
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
