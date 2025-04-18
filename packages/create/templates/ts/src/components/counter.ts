import { Jadis } from '@jadis/core';

class Counter extends Jadis {
  static selector = 'counter-page' as const;
  static template = `
    <p>Count: <span></span></p>
    <button id="increment">Increment</button>
  `;
  events = this.useEvents({ change: Number });
  private count = 0;

  onConnect(): void {
    this.updateCount();

    this.listenOn(this.incrementButtonElement)
      .when('click')
      .do(() => this.increment());
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
