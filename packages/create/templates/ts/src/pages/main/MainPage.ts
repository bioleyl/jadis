import { createElement, html, Jadis } from '@jadis/core';

import logo from '../../assets/logo.svg';
import Counter from '../../components/counter';
import { myRouter } from '../../router';
import style from './MainPage.css?inline';

class MainPage extends Jadis {
  static readonly selector = 'main-page';

  templateHtml(): DocumentFragment {
    return html`
      <div class="header"></div>

      <div>
        <input type="text" placeholder="Enter your name" id="nameInput" />
        <button id="greetButton">Greet</button>
      </div>

      <div class="wrapper"></div>
    `;
  }

  templateCss(): string {
    return style;
  }

  onConnect(): void {
    createElement('img', { src: logo }, this.headerElement);

    this.wrapperElement.replaceChildren(...Array.from({ length: 3 }).map((_, i) => this.createCounter(i)));

    this.on(this.buttonElement, 'click', () => this.onButtonClick());
  }

  private onButtonClick(): void {
    myRouter.gotoName('hello', { name: this.inputElement.value });
  }

  private createCounter(id: number): Counter {
    const counter = new Counter();
    counter.events.register('change', (count) => {
      return console.log(`Counter id ${id}:`, count);
    });
    return counter;
  }

  get inputElement(): HTMLInputElement {
    return this.getElement('input');
  }

  get buttonElement(): HTMLButtonElement {
    return this.getElement('button');
  }

  get wrapperElement(): HTMLDivElement {
    return this.getElement('.wrapper');
  }

  get headerElement(): HTMLDivElement {
    return this.getElement('.header');
  }
}

MainPage.register();

export default MainPage;
