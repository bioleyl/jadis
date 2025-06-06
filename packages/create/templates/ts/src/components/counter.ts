import { html, Jadis } from '@jadis/core';

const template = html`
  <p>Count: <span></span></p>
  <button id="increment">Increment</button>
`;

class Counter extends Jadis {
  static readonly selector = 'counter-component';
  static readonly template = template;
  events = this.useEvents<{
    change: number;
  }>();
  private count = 0;

  onConnect(): void {
    this.updateCount();

    this.on(this.incrementButtonElement, 'click', () => this.increment());
  }

  private increment(): void {
    this.count++;
    this.events.emit('change', this.count);
    this.updateCount();
  }

  private updateCount(): void {
    this.countElement.textContent = this.count.toString();
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
