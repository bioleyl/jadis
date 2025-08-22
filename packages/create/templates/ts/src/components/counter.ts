import { html, Jadis } from '@jadis/core';

class Counter extends Jadis {
  static readonly selector = 'counter-component';

  events = this.useEvents<{
    change: number;
  }>();

  private _count = 0;

  templateHtml(): DocumentFragment {
    return html`
      <p>Count: <span></span></p>
      <button id="increment">Increment</button>
    `;
  }

  onConnect(): void {
    this.updateCount();

    this.on(this.incrementButtonElement, 'click', () => this.increment());
  }

  private increment(): void {
    this._count++;
    this.events.emit('change', this._count);
    this.updateCount();
  }

  private updateCount(): void {
    this.countElement.textContent = this._count.toString();
  }

  private get countElement(): HTMLSpanElement {
    return this.getElement('span');
  }

  private get incrementButtonElement(): HTMLButtonElement {
    return this.getElement('#increment');
  }
}

Counter.register();

export default Counter;
