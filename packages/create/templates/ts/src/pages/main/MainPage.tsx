import { createElement } from '@jadis/core';

import logo from '../../assets/logo.svg';
import Counter from '../../components/Counter';
import NameInput from '../../components/NameInput';
import { myRouter } from '../../router';
import style from './MainPage.css?inline';

export default class MainPage extends Jadis {
  static readonly selector = 'main-page';

  private readonly _refs = this.useRefs((ref) => ({
    header: ref<HTMLDivElement>('.header'),
    input: ref<NameInput>(NameInput.toString()),
  }));

  templateHtml(): Node {
    return (
      <div class="header"></div>
      <NameInput label="Your name" placeholder="Enter your name" />
      <div class="wrapper">
        {Array.from({ length: 3 }, (_, i) => (
          <Counter />
        ))}
      </div>
    );
  }

  templateCss(): string {
    return style;
  }

  onConnect(): void {
    const { header } = this._refs;

    createElement('img', { attrs: { src: logo } }, header);

    this._refs.input.events.register('greet', (name) => {
      if (!name) { throw new Error('Name is required'); }
      myRouter.goto('hello', { name });
    });
  }

  private createCounter(id: number): Counter {
    const counter = createElement(Counter);
    counter.events.register('change', (count) =>
      console.log(`Counter id ${id}:`, count),
    );
    return counter;
  }
}

MainPage.register();
