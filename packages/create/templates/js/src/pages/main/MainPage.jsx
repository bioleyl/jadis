/// <reference types="@jadis/core/jsx-runtime" />
/** @jsxImportSource @jadis/core */

import { createElement, createSelector, Jadis } from '@jadis/core';

import logo from '../../assets/logo.svg';
import Counter from '../../components/Counter';
import NameInput from '../../components/NameInput';
import { myRouter } from '../../router';
import style from './MainPage.css?inline';

export default class MainPage extends Jadis {
  static selector = createSelector('main-page');

  refs = this.useRefs((ref) => ({
    /** @type {HTMLDivElement} */
    header: ref('.header'),
    /** @type {NameInput} */
    input: ref(NameInput.toString()),
  }));

  templateHtml() {
    return (
      <>
        <div class="header" />
        <NameInput label="Your name" placeholder="Enter your name" />
        <div class="wrapper">
          {Array.from({ length: 3 }, (_, _i) => (
            <Counter />
          ))}
        </div>
      </>
    );
  }

  templateCss() {
    return style;
  }

  onConnect() {
    const { header } = this.refs;

    createElement('img', { attrs: { src: logo } }, header);

    this.refs.input.events.register('greet', (name) => {
      if (!name) {
        throw new Error('Name is required');
      }
      myRouter.goto('hello', { name });
    });
  }

  /**
   * @param {number} id
   * @returns {Counter}
   */
  createCounter(id) {
    const counter = createElement(Counter);
    counter.events.register('change', (count) =>
      console.log(`Counter id ${id}:`, count),
    );
    return counter;
  }
}

MainPage.register();
