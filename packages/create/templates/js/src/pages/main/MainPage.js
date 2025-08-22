import { createElement, createSelector, html, Jadis } from '@jadis/core';

import logo from '../../assets/logo.svg';
import Counter from '../../components/counter';
import { myRouter } from '../../router';
import style from './MainPage.css?inline';

class MainPage extends Jadis {
  static selector = createSelector('main-page');

  templateHtml() {
    return html`
      <div class="header"></div>

      <div>
        <input type="text" placeholder="Enter your name" id="nameInput" />
        <button id="greetButton">Greet</button>
      </div>

      <div class="wrapper"></div>
    `;
  }

  templateCss() {
    return style;
  }

  onConnect() {
    createElement('img', { src: logo }, this.headerElement);

    this.wrapperElement.replaceChildren(...Array.from({ length: 3 }).map((_, i) => this.#createCounter(i)));

    this.on(this.buttonElement, 'click', () => this.#onButtonClick());
  }

  #onButtonClick() {
    myRouter.gotoName('hello', { name: this.inputElement.value });
  }

  #createCounter(id) {
    const counter = new Counter();
    counter.events.register('change', (count) => {
      return console.log(`Counter id ${id}:`, count);
    });
    return counter;
  }

  /** @returns {HTMLInputElement} */
  get inputElement() {
    return this.getElement('input');
  }

  /** @returns {HtmlButtonElement} */
  get buttonElement() {
    return this.getElement('button');
  }

  /** @returns {HTMLDivElement} */
  get wrapperElement() {
    return this.getElement('.wrapper');
  }

  /** @returns {HTMLDivElement} */
  get headerElement() {
    return this.getElement('.header');
  }
}

MainPage.register();

export default MainPage;
