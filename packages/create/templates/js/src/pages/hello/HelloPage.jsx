/// <reference types="@jadis/core/jsx-runtime" />
/** @jsxImportSource @jadis/core */

import { createSelector, css, Jadis } from '@jadis/core';

import { myRouter } from '../../router';

export default class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

  refs = this.useRefs((ref) => ({
    button: ref('button'),
    name: ref('span'),
  }));

  attrs = this.useAttributes({
    name: (value) => {
      this.refs.name.textContent = value ?? '';
    },
  });

  templateHtml() {
    return (
      <>
        <h1>
          Hello, <span />!
        </h1>
        <p>Welcome to the Hello Page.</p>
        <p>Click the button to go back to the main page.</p>
        <button type="button">Go Back</button>
      </>
    );
  }

  templateCss() {
    return css`
      h1 {
        color: blue;
      }
    `;
  }

  onConnect() {
    const { name, button } = this.refs;

    name.textContent = this.attrs.name;
    this.on(button, 'click', () => this.onButtonClick());
  }

  onButtonClick() {
    myRouter.goto('main');
  }
}

HelloPage.register();
