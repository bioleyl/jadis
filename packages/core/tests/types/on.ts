import { Jadis } from '@jadis/core';

class Listener extends Jadis {
  static readonly selector = 'x-listener';

  listen(): void {
    this.on(window, 'popstate', (event) => event.state);
    this.on(document, 'visibilitychange', (event) => event.timeStamp);
    // @ts-expect-error A window event is checked against the window's events.
    this.on(window, 'not-an-event', () => undefined);
    // @ts-expect-error An element's event name is still checked.
    this.on(document.body, 'clik', () => undefined);
  }
}

void Listener;
