import { createElement, Jadis } from '@jadis/core';
import template from './main-page.html?raw';
import style from './main-page.css?inline';
import { myRouter } from '../../router';
import Counter from '../../components/counter';
import logo from '../../assets/logo.svg';

class MainPage extends Jadis {
  static readonly selector = 'main-page';
  static readonly template = template;
  static readonly style = style;

  onConnect(): void {
    createElement('img', { src: logo }, this.headerElement);

    this.wrapperElement.replaceChildren(
      ...Array.from({ length: 3 }).map((_, i) => this.createCounter(i))
    );

    this.listenOn(this.buttonElement)
      .when('click')
      .do(() => this.onButtonClick());
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
