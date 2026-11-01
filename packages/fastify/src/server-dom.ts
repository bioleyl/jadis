// The DOM of a worker thread: happy-dom's window as its globals, set up before the app's server entry loads (a Jadis
// class extends HTMLElement as its module evaluates). Each worker has its own globals: Fastify's thread never sees a
// `window` or a `document`.
import { GlobalRegistrator } from '@happy-dom/global-registrator';

const VIEWPORT = { height: 900, width: 1280 };
const PART = 'part';

/** A `part` token list over the attribute: happy-dom gives elements none. */
function partTokens(element: Element): Pick<DOMTokenList, 'add' | 'contains' | 'remove' | 'toggle' | 'value'> {
  const read = (): Set<string> => new Set((element.getAttribute(PART) ?? '').split(/\s+/).filter(Boolean));
  const write = (tokens: Iterable<string>): void => element.setAttribute(PART, [...tokens].join(' '));
  const tokens = {
    add: (...names: string[]) => write(new Set([...read(), ...names])),
    contains: (name: string) => read().has(name),
    remove: (...names: string[]) => write([...read()].filter((token) => !names.includes(token))),
    toggle: (name: string, force?: boolean) => {
      const present = force ?? !read().has(name);
      (present ? tokens.add : tokens.remove)(name);
      return present;
    },
    get value() {
      return element.getAttribute(PART) ?? '';
    },
  };
  return tokens;
}

/** A component's fetch during a render is a mistake: its data comes from the page's loader, before the render. */
const refusedFetch = (): Promise<Response> =>
  Promise.reject(
    new Error("[jadis] a component fetched during a server render: load the page's data before, with server.fetch")
  );

/** Sets happy-dom up as this thread's globals, with what it lacks for a render. */
export function installServerDom(): void {
  GlobalRegistrator.register({
    ...VIEWPORT,
    settings: {
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true,
      navigation: { disableMainFrameNavigation: true },
    },
    url: 'http://localhost/',
  });
  globalThis.fetch = refusedFetch;
  if (!(PART in Element.prototype)) {
    Object.defineProperty(Element.prototype, PART, {
      configurable: true,
      get(this: Element) {
        return partTokens(this);
      },
    });
  }
}

/**
 * Lets go of what happy-dom remembered for the renders so far. Every query in a page adds an entry to a list on the
 * document, which happy-dom empties only when the document's own children change: a thread rendering page after page
 * would keep them all. Adding a node to the document and taking it out empties it.
 */
export function releaseDocumentCaches(): void {
  document.appendChild(document.createComment('')).remove();
}
