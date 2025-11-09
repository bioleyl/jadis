import { createElement, html, Jadis } from '@jadis/core';

import logo from '../../assets/logo.svg';
import Counter from '../../components/counter';
import { myRouter } from '../../router';
import style from './MainPage.css?inline';

class MainPage extends Jadis {
  static readonly selector = 'main-page';

  readonly refs = this.useRefs((ref) => ({
    greetButton: ref('button'),
    header: ref<HTMLDivElement>('.header'),
    input: ref('input'),
    wrapper: ref<HTMLDivElement>('.wrapper'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <div class="header"></div>

      <div>
        <label for="nameInput">Your Name:</label>
        <input type="text" placeholder="Enter your name"/>
        <button>Greet</button>
      </div>

      <div class="wrapper"></div>
    `;
  }

  templateCss(): string {
    return style;
  }

  onConnect(): void {
    const { greetButton, header, wrapper } = this.refs;

    createElement('img', { src: logo }, header);
    wrapper.replaceChildren(...Array.from({ length: 3 }).map((_, i) => this.createCounter(i)));
    this.on(greetButton, 'click', () => this.onButtonClick());
  }

  private onButtonClick(): void {
    myRouter.gotoName('hello', { name: this.refs.input.value });
  }

  private createCounter(id: number): Counter {
    const counter = new Counter();
    counter.events.register('change', (count) => {
      return console.log(`Counter id ${id}:`, count);
    });
    return counter;
  }
}

MainPage.register();

export default MainPage;
