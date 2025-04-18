import { createElement, Jadis } from '@jadis/core';
import template from './main-page.html?raw';
import style from './main-page.css?inline';
import { myRouter } from '../../main';
import Counter from '../../components/counter';
import logo from '../../assets/logo.svg';

class MainPage extends Jadis {
  static selector = 'main-page';
  static template = template;
  static style = style;

  onConnect() {
    createElement('img', { src: logo }, this.headerElement);

    this.wrapperElement.replaceChildren(
      ...Array.from({ length: 3 }).map((_, i) => this.#createCounter(i))
    );

    this.listenOn(this.buttonElement)
      .when('click')
      .do(() => this.#onButtonClick());
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
