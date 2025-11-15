import { createSelector, html, Jadis } from '@jadis/core';

export default class Counter extends Jadis {
  static selector = createSelector('counter-component');

  /** @type {import('@jadis/core').UseEventsHandler<{change: number}>} */
  events = this.useEvents();

  count = this.useChange(
    0,
    (val) => {
      this.refs.count.textContent = val.toString();
      this.events.emit('change', val);
    },
    { immediate: true }
  );

  refs = this.useRefs((ref) => ({
    count: ref('span'),
    incrementButton: ref('button'),
  }));

  templateHtml() {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect() {
    this.on(this.refs.incrementButton, 'click', () => this.count.set((v) => v + 1));
  }
}

Counter.register();
