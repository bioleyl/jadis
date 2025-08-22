import { createSelector, html, Jadis } from '@jadis/core';

class Counter extends Jadis {
  static selector = createSelector('counter-component');

  events = this.useEvents({ change: Number });
  #count = 0;

  templateHtml() {
    return html`
      <p>Count: <span></span></p>
      <button id="increment">Increment</button>
    `;
  }

  onConnect() {
    this.#updateCount();
    this.on(this.incrementButtonElement, 'click', () => this.#increment());
  }

  #increment() {
    this.#count++;
    this.events.emit('change', this.#count);
    this.#updateCount();
  }

  #updateCount() {
    this.countElement.textContent = this.#count.toString();
  }

  /** @returns {HTMLSpanElement} */
  get countElement() {
    return this.getElement('span');
  }

  /** @returns {HTMLButtonElement} */
  get incrementButtonElement() {
    return this.getElement('#increment');
  }
}

Counter.register();

export default Counter;
