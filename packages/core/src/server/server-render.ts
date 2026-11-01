import { serializeHtml } from './html-writer';
import { SETTLE_TASKS } from './server-constants';

export interface RenderOptions {
  /**
   * Resolves once the content is ready to be written, called after the components' `onConnect`: a page that loads
   * its data once connected gives a promise of that data here.
   */
  ready?: () => Promise<void>;
}

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

async function settle(): Promise<void> {
  for (let task = 0; task < SETTLE_TASKS; task++) {
    await nextTask();
  }
}

/**
 * Renders content in the document the way the browser would, then writes it as HTML for a server's response. The
 * components connect, so their attributes, `useChange` values, translations and `onConnect` all draw before the
 * content is written, each shadow root as declarative shadow DOM. Then the content leaves the document: its
 * listeners and kill signals end with the render.
 *
 * It needs a DOM where the components are defined: a server one (happy-dom, jsdom) set up as the globals before the
 * components' modules load. In the browser, the page parses the markup into the same shadow roots before any script
 * runs; when a component upgrades, its shadow root is emptied and rendered again, so the first paint needs no
 * JavaScript and the component then behaves as usual.
 * @param content A node (a component written in JSX) or HTML text
 * @param options When the content is ready to be written
 * @returns The HTML of the content
 * @example
 * const html = await renderToHtml(<ProductPage product={product} />);
 */
export async function renderToHtml(content: Node | string, options: RenderOptions = {}): Promise<string> {
  const container = document.createElement('div');
  if (typeof content === 'string') {
    container.innerHTML = content;
  } else {
    container.append(content);
  }

  document.body.append(container);
  try {
    await settle();
    await options.ready?.();
    return Array.from(container.childNodes, serializeHtml).join('');
  } finally {
    container.remove();
  }
}
