# Limits and Troubleshooting

## Limits

**The server has no layout.** happy-dom builds the DOM but measures nothing: sizes and positions are zero. What a component measures (an indicator under the selected tab, a graph fitted to its box, a list that shows only the rows in view) is missing or wrong in the first paint, until the component runs in the browser. Draw a reasonable first state with CSS where it matters (the selected tab styled by an attribute, not only by the measured indicator).

**Time.** A render waits for the components' `onConnect` and for the page's data, not for timers: a skeleton shown after a delay, an animation, a refresh every minute are drawn as they are when the render ends.

**Interactivity comes with the code.** The components render again in the browser: server rendering gives the first paint, not an earlier interactive page. The code to load and run is the same as without it.

**Styles in every shadow root.** Each instance of a component carries its `<style>` in the markup. A page of many components repeats the same CSS many times: it compresses very well (a 180 kB page of jlib components is 14 kB gzipped, 10 kB with brotli), but it is parsed each time.

**Module state is shared.** A worker renders many requests: a module's state (a translator's language, a cache) is the same for all of them. Per-request values go through `render`'s arguments.

## Troubleshooting

| What you see | Why | What to do |
|---|---|---|
| A component shows empty for a moment after the code loads | Its state was set in code, in a field bound to no attribute, or a task after its definition | Bind the field to an attribute, or set it in the same task as the definition ([Taking Over](./takeover.md#what-code-must-give-back)) |
| The page flashes once the code loads, then shows again | The router made the page again: the mount point's elements did not match the route | Put the server's body inside the router's mount point; history mode; the same route table on both sides |
| A component's template shows twice | A component without shadow root, rendered by a server without the mark | Render with `serializeHtml()` or `renderToHtml()`, which write it |
| `NotSupportedError: … already hosts a shadow tree` | Something attached a shadow root before the component's constructor | Let the browser attach the declarative roots; attach nothing yourself |
| `a component fetched during a server render` | A component calls `fetch` while the page renders | Load the data in the page's `load`, with the fetch the server gives |
| Icons or texts missing once the code loads | The components upgraded before the app registered them | Register before importing the components, or redraw at the end of the task |
| A value written in the markup comes back wrong | Its field's `parse` does not read back what was written | The value is left out instead: fix `parse`, or keep the value out of the attribute |
| Another visitor's data in a page | Per-visitor state in a module, or a shared cache | Pass it through `render`'s arguments; `cache-control: private, no-store` |
| Memory grows with every page | happy-dom's query caches, on a server of your own | Let go after each render ([Without Fastify](./without-fastify.md#one-document-many-renders)) |
