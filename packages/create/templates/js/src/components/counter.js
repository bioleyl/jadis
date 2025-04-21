import { Jadis, html } from '@jadis/core';

const template = html`
  <p>Count: <span></span></p>
  <button id="increment">Increment</button>
`;

class Counter extends Jadis {
  static selector = 'counter-component';
  static template = template;
  events = this.useEvents({ change: Number });
  #count = 0;

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
