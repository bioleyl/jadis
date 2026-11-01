# Without Fastify

`@jadis/fastify` is one host for the render; `@jadis/core/server` works with any server, and at build time. What the plugin does for you, done by hand:

## The DOM, before the components

A component's class extends `HTMLElement` as its module loads: a DOM must be the global one **before** the app's server code is imported.

```ts
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register({
  url: 'http://localhost/',
  settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
});

const { render } = await import('./dist/server/entry-server.js');
```

These globals (`window`, `document`, happy-dom's `fetch`) then belong to the whole process: a `fetch` of the server's own code goes through happy-dom's. Keep Node's before registering (`const nodeFetch = globalThis.fetch`), or render in a [worker thread](https://nodejs.org/api/worker_threads.html) of its own, as the plugin does.

## One document, many renders

Every render shares the one document, and the modules' state:

- `renderToHtml()` renders in a container of its own and takes it out of the document once written, so two renders never see each other's nodes.
- A module's state (a translator's language, a registry) is shared by every render of the process.
- happy-dom remembers every query made in the document in a list it empties only when the document's own children change. A server rendering page after page keeps them all, unless it lets go after each render:

```ts
document.appendChild(document.createComment('')).remove();
```

## What happy-dom lacks

| Missing | Used by | Remedy |
|---|---|---|
| `attachInternals()` | form controls, roles on the host | the component falls back to inert internals (jlib does) |
| `element.part` | `part.toggle(…)` | a token list over the `part` attribute (the plugin installs one) |
| Layout | anything measured | nothing: see [Limits](./limits.md) |

A cancelled animation's `finished` promise is rejected unhandled by happy-dom, where browsers mark it handled: log unhandled rejections instead of letting them stop the process.

## Any server

```ts
// Express, Hono, a Node http server: the same three steps
const page = await render(request.url, { cookie: request.headers.cookie ?? '' });
const html = shell.replace('<!--app-head-->', () => page.head ?? '').replace('<!--app-body-->', () => page.body);
response.status(page.status ?? 200).set(page.headers ?? {}).type('html').send(html);
document.appendChild(document.createComment('')).remove();
```

Replace with functions, as above: a replacement string reads `$&` or `$'` in the page (in a code example) as patterns.

## At build time

Pages that are the same for everyone can be rendered once, at build time, and served as files:

```ts
for (const path of ['/', '/recipes/pancakes', '/recipes/carbonara']) {
  const rendered = await renderRoute(routes, path, { prepare });
  writeFileSync(fileOf(path), shell.replace('<!--app-body-->', () => rendered?.body ?? ''));
}
```

The browser takes them over exactly as it takes over a server's response.
