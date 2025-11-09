import { createElement, createSelector, html, Jadis } from '@jadis/core';

import logo from '../../assets/logo.svg';
import Counter from '../../components/counter';
import { myRouter } from '../../router';
import style from './MainPage.css?inline';

class MainPage extends Jadis {
  static selector = createSelector('main-page');

  refs = this.useRefs((ref) => ({
    greetButton: ref('button'),
    /** @type {HTMLDivElement} */
    header: ref('.header'),
    nameInput: ref('input'),
    /** @type {HTMLDivElement} */
    wrapper: ref('.wrapper'),
  }));

  templateHtml() {
    return html`
      <div class="header"></div>

      <div>
        <input type="text" placeholder="Enter your name"/>
        <button>Greet</button>
      </div>

      <div class="wrapper"></div>
    `;
  }

  templateCss() {
    return style;
  }

  onConnect() {
    const { greetButton, header, wrapper } = this.refs;

    createElement('img', { src: logo }, header);
    wrapper.replaceChildren(...Array.from({ length: 3 }).map((_, i) => this.#createCounter(i)));
    this.on(greetButton, 'click', () => this.#onButtonClick());
  }

  #onButtonClick() {
    myRouter.gotoName('hello', { name: this.refs.nameInput.value });
  }

  #createCounter(id) {
    const counter = new Counter();
    counter.events.register('change', (count) => {
      return console.log(`Counter id ${id}:`, count);
    });
    return counter;
  }
}

MainPage.register();

export default MainPage;
