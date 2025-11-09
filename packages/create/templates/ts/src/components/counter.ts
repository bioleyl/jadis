import { html, Jadis } from '@jadis/core';

class Counter extends Jadis {
  static readonly selector = 'counter-component';

  readonly events = this.useEvents<{
    change: number;
  }>();

  readonly refs = this.useRefs((ref) => ({
    count: ref('span'),
    incrementButton: ref('button'),
  }));

  private _count = 0;

  templateHtml(): DocumentFragment {
    return html`
      <p>Count: <span></span></p>
      <button>Increment</button>
    `;
  }

  onConnect(): void {
    this.updateCount();

    this.on(this.refs.incrementButton, 'click', () => this.increment());
  }

  private increment(): void {
    this._count++;
    this.events.emit('change', this._count);
    this.updateCount();
  }

  private updateCount(): void {
    this.refs.count.textContent = this._count.toString();
  }
}

Counter.register();

export default Counter;
