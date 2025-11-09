import { createSelector, html, Jadis } from '@jadis/core';

class Counter extends Jadis {
  static selector = createSelector('counter-component');

  events = this.useEvents({ change: Number });
  refs = this.useRefs((ref) => ({
    count: ref('span'),
    incrementButton: ref('button'),
  }));
  #count = 0;

  templateHtml() {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect() {
    this.#updateCount();
    this.on(this.refs.incrementButton, 'click', () => this.#increment());
  }

  #increment() {
    this.#count++;
    this.events.emit('change', this.#count);
    this.#updateCount();
  }

  #updateCount() {
    this.refs.count.textContent = this.#count.toString();
  }
}

Counter.register();

export default Counter;
