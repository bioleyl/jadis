# Server Rendering

*Jadis* can render a page on the server, so that it arrives as HTML. The browser paints it before any script runs, search engines read it, and a slow connection shows the page before the code. Once the components' code has loaded, they take the page over and the app runs as usual: the next pages show without a page load.

```
 GET /recipes/pancakes
   │
   ▼
 Fastify ─── the API, sessions, redirects: its own routes
   │  every other GET is a page
   ▼
 @jadis/fastify ── a worker thread, with a server-side DOM
   │  renderRoute(routes, url): the page of the URL, from the app's route table
   │  page.load(route, api): its data, before the render
   │  the page draws; written as HTML, each shadow root as declarative shadow DOM
   ▼
 the browser paints the HTML: no JavaScript needed
   │  the components' code loads
   ▼
 each component upgrades in place, from its attributes
 the router takes the page over, then shows the next pages itself
```

## How it works

A *Jadis* component renders real DOM, not a string. So the server renders it the same way: in a DOM. A server-side one ([happy-dom](https://github.com/capricorn86/happy-dom)) holds the page, every component connects and draws as in a browser (attributes, `useChange` values, translations, `onConnect`), and the result is written as HTML.

Each shadow root is written as a [declarative shadow root](https://developer.chrome.com/docs/css-ui/declarative-shadow-dom), with its styles inside:

```html
<recipe-page slug="pancakes" data='{"found":true,"recipe":{…}}'>
  <template shadowrootmode="open">
    <style>:host { display: block; } …</style>
    <h1>Fluffy Pancakes</h1>
    …
  </template>
</recipe-page>
```

The browser attaches it as it parses the page, so the page is painted, styled, before any script. When the component's definition loads, its constructor attaches its shadow root, gets the declarative one, emptied, and renders its template again from the element's attributes: in the same task, so nothing flashes. This is not a hydration that reuses the server's nodes. The component renders as it always does, from a state the server wrote on the element.

That state travels in **attributes**. The values a component's attribute-bound fields (`useChange(…, { attribute })`) were given in code on the server, a page's data among them, are written as those attributes. The component upgrades with them, and needs nothing more from the browser.

## The pieces

| | |
|---|---|
| `@jadis/core/server` | `renderToHtml()` renders content and writes it as HTML; `renderRoute()` renders the page of a URL from the app's routes; `serializeHtml()` writes a node |
| The router | On its first show, it takes over the page the server rendered in its mount point, instead of making it again |
| `@jadis/fastify` | A Fastify plugin: every GET no other route answers is a page, rendered in a worker thread and put in the page's shell; Vite in development |

The app has **one route table**. The browser's router follows it, and the server renders from it. Fastify keeps what is HTTP's: the API, cookies and sessions, redirects, cache headers.

## When to use it

- **Public pages**: a shop, recipes, articles, documentation. The first paint without JavaScript and pages search engines read are what server rendering gives.
- **Slow devices and connections**: the page shows while the code loads.

It does not make a page interactive sooner: the components render again in the browser, so the code to load and run is the same. For an app behind a login, where no search engine goes, rendering only the frame on the server (the shell, the navigation, placeholders) and loading the data in the browser may be enough, and cheaper.

## The example

[Cooking, rendered on the server](https://github.com/bioleyl/jadis-examples/tree/main/packages/cooking-ssr) is a complete app on Fastify: recipes, a search that works without JavaScript, a 404, an interactive servings scaler. The pages of this section use its code.

## Next

- [An App on Fastify](./fastify.md): setting an app up, file by file.
- [Data and Responses](./data.md): loading a page's data, sessions, status codes, titles, caching.
- [Taking Over in the Browser](./takeover.md): what the upgrade keeps, and what code must give back.
- [Without Fastify](./without-fastify.md): another server, a static build.
- [Limits and Troubleshooting](./limits.md).
