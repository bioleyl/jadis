# @jadis/core/server

Renders components to HTML on a server, in a server-side DOM set up as the globals before the components' modules load (see [Without Fastify](../server-rendering/without-fastify.md)). A component that never ships to a server never imports any of it.

```ts
import { renderRoute, renderToHtml, serializeHtml } from '@jadis/core/server';
```

## `renderRoute()`

Renders the page of a path, matched in the app's routes the way its router matches it, as the router would mount it: the group's root component, then the page, with the route's parameters as attributes.

```tsx
const rendered = await renderRoute(routes, '/recipes/pancakes?servings=6', {
  prepare: (page, route) => (page as RecipePage).load(route, serverApi),
});
```

### Signature

```typescript
renderRoute(
  routes: Record<string, RouteDefinition>,
  path: string,
  options?: RouteRenderOptions
): Promise<RenderedRoute | undefined>;

interface RouteRenderOptions extends SerializeOptions {
  prepare?: (page: HTMLElement, route: ActiveRoute) => Promise<void>;
}

interface RenderedRoute {
  route: ActiveRoute;
  body: string;
  page: HTMLElement;
}
```

| Parameter | Description |
|---|---|
| `routes` | The app's routes, as given to its `Router` |
| `path` | The path asked, its query included, without the base URL |
| `options.prepare` | Gives the page what it shows before the render. The page is created, not connected yet; values set on its attribute-bound fields go out in the markup |
| `options.styles` | Where the components' stylesheets go: see [`serializeHtml()`](#serializehtml) |

| Result | Description |
|---|---|
| `route` | The route matched, with its parameters and its query |
| `body` | The route's elements as HTML, from the root component down |
| `page` | The page element as rendered: what it holds gives the response its status or title |

It gives `undefined` when no route matches the path. Put `body` in the router's mount point: the browser's router takes these elements over.

## `renderToHtml()`

Renders content in the document the way the browser would, then writes it as HTML.

```tsx
const html = await renderToHtml(<GreetingCard name="Ada" />);
const html2 = await renderToHtml('<greeting-card name="Ada"></greeting-card>');
```

### Signature

```typescript
renderToHtml(content: Node | string, options?: RenderOptions): Promise<string>;

interface RenderOptions extends SerializeOptions {
  ready?: () => Promise<void>;
}
```

| Parameter | Description |
|---|---|
| `content` | A node (a component written in JSX) or HTML text |
| `options.ready` | Awaited after the components' `onConnect`, before the content is written: a page that loads its data once connected gives a promise of it here |
| `options.styles` | Where the components' stylesheets go: see [`serializeHtml()`](#serializehtml) |

The content goes in a container of its own in the document. The components connect and draw (attributes, `useChange` values, translations, `onConnect` and what it does at once), the content is written with `serializeHtml()`, then it leaves the document: its listeners and kill signals end with the render.

## `serializeHtml()`

Writes a node as HTML, like `outerHTML`, with what a server render needs on top:

- each **open shadow root** as a `<template shadowrootmode="open">` before the light children, with its options (`shadowrootdelegatesfocus`, `shadowrootclonable`, `shadowrootserializable`); a closed one is left out;
- the **state of a component**: the values its attribute-bound `useChange` fields were given in code, as those attributes, when the field's parser reads them back as the same value ([State in attributes](../server-rendering/takeover.md#state-in-attributes));
- a `<!--jadis-template-->` mark before the template of a **component without shadow root**, which its upgrade replaces;
- the **state of form fields**: a value set in code, a checked box, a chosen option, a text area's text; never a password's value;
- the **stylesheets a shadow root adopted**, which hold no node: inline as a `<style>`, or as a `<link>` to a file (below).

```ts
serializeHtml(document.querySelector('recipe-page'));
```

### Signature

```typescript
serializeHtml(node: Node, options?: SerializeOptions): string;

interface SerializeOptions {
  styles?: (css: string) => string | undefined;
}
```

| Parameter | Description |
|---|---|
| `node` | The node to write |
| `options.styles` | Given the CSS of an adopted stylesheet, the address of a file that holds it: written as `<link rel="stylesheet" href="…">`. Undefined, the default, writes the CSS inline as a `<style>` |

### Stylesheets shared between roots and pages

A component's `templateCss()` becomes one stylesheet, which every instance adopts (see [Add Style](../templating/css.md)). Inline, each shadow root of the markup still carries its own copy. With `styles`, each distinct stylesheet becomes a file every root links to: the browser downloads it once for the whole site.

With [`@jadis/fastify`](../server-rendering/fastify.md#stylesheets-as-files), pass `server.styles`: the plugin serves the files and preloads them. A server of its own keeps each file before it sends the page that links to it, or the browser asks for a file that does not exist yet:

```ts
const files = new Map<string, string>(); // address → CSS, which the server answers before the page is sent

const rendered = await renderRoute(routes, path, {
  styles: (css) => {
    const href = `/styles/${hashOf(css)}.css`;
    files.set(href, css);
    return href;
  },
});
```

Until a file is in the browser's cache, browsers do not agree on what they paint:

| Browser | First visit | File cached |
|---|---|---|
| Chromium | Nothing until the file has loaded, then the styled page | The styled page at once |
| Firefox | The content unstyled, then styled once the file has loaded | The styled page at once |

Measured with Playwright 1.63 (Chromium 153, Firefox), a file that took 1.5 s to arrive: Chromium painted at 1.5 s, Firefox at 30 ms without the styles, preloaded or not. Safari was not measured. Linked stylesheets suit pages visited again (an app behind a login) more than a page seen once (a landing page), where inline styles paint at once everywhere. Preload the files in the `<head>` (`<link rel="preload" as="style">`) so that they load at once, side by side.

A document or a fragment is written as its children; a document's doctype is written. Text is escaped, the text of `<style>` and `<script>` is written as it is, void elements have no end tag, and SVG elements keep the case of their names.
