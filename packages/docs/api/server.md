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

interface RouteRenderOptions {
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

interface RenderOptions {
  ready?: () => Promise<void>;
}
```

| Parameter | Description |
|---|---|
| `content` | A node (a component written in JSX) or HTML text |
| `options.ready` | Awaited after the components' `onConnect`, before the content is written: a page that loads its data once connected gives a promise of it here |

The content goes in a container of its own in the document. The components connect and draw (attributes, `useChange` values, translations, `onConnect` and what it does at once), the content is written with `serializeHtml()`, then it leaves the document: its listeners and kill signals end with the render.

## `serializeHtml()`

Writes a node as HTML, like `outerHTML`, with what a server render needs on top:

- each **open shadow root** as a `<template shadowrootmode="open">` before the light children, with its options (`shadowrootdelegatesfocus`, `shadowrootclonable`, `shadowrootserializable`); a closed one is left out;
- the **state of a component**: the values its attribute-bound `useChange` fields were given in code, as those attributes, when the field's parser reads them back as the same value ([State in attributes](../server-rendering/takeover.md#state-in-attributes));
- a `<!--jadis-template-->` mark before the template of a **component without shadow root**, which its upgrade replaces;
- the **state of form fields**: a value set in code, a checked box, a chosen option, a text area's text; never a password's value.

```ts
serializeHtml(document.querySelector('recipe-page'));
```

### Signature

```typescript
serializeHtml(node: Node): string;
```

A document or a fragment is written as its children; a document's doctype is written. Text is escaped, the text of `<style>` and `<script>` is written as it is, void elements have no end tag, and SVG elements keep the case of their names.
