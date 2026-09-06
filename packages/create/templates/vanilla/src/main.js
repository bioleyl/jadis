import { createElement, Jadis } from '@jadis/core';

class HelloWorld extends Jadis {
  static selector = 'hello-world';

  templateHtml() {
    return createElement('p', {
      props: { textContent: 'Hello from Jadis without JSX.' },
    });
  }
}

HelloWorld.register();
