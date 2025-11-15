import { html, Jadis } from '@jadis/core';

export default class Counter extends Jadis {
  static readonly selector = 'counter-component';

  readonly events = this.useEvents<{
    change: number;
  }>();

  private readonly _count = this.useChange(
    0,
    (val) => {
      this._refs.count.textContent = val.toString();
      this.events.emit('change', val);
    },
    { immediate: true }
  );

  private readonly _refs = this.useRefs((ref) => ({
    count: ref('span'),
    incrementButton: ref('button'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <p>Count: <span></span></p>
      <slot></slot>
      <button>Increment</button>
      <slot name="footer">
    `;
  }

  onConnect(): void {
    this.on(this._refs.incrementButton, 'click', () => this._count.set((v) => v + 1));
  }
}

Counter.register();
