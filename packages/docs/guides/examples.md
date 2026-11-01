# Examples

Explore working Jadis projects to see the library in action. These examples demonstrate real-world usage patterns, component composition, and state management.

## Todo List

A classic todo list application showcasing:

- Component structure and composition
- Event handling and state management with `useChange()`
- Clean, type-safe code

- **Source code:** [github.com/bioleyl/jadis-examples/todo-list](https://github.com/bioleyl/jadis-examples/tree/main/packages/todo-list)
- **Live demo:** [bioleyl.github.io/jadis-examples/todo-list](https://bioleyl.github.io/jadis-examples/todo-list/)

## Cooking

A recipe app, in the browser only:

- A search over a list, a preview in a modal, a page per recipe
- Routing with parameters, in hash mode

- **Source code:** [github.com/bioleyl/jadis-examples/cooking](https://github.com/bioleyl/jadis-examples/tree/main/packages/cooking)
- **Live demo:** [bioleyl.github.io/jadis-examples/cooking](https://bioleyl.github.io/jadis-examples/cooking/)

## Cooking, Rendered on the Server

The same recipes as a site [Fastify](https://fastify.dev) renders, then taken over in the browser:

- One route table for the server and the browser, `renderRoute()` and `@jadis/fastify`
- Pages that load their data before the render, carried to the browser in an attribute
- A search that works without JavaScript, a 404 for a missing recipe, a cache header for public pages
- An interactive servings scaler once the code has loaded

It needs a Node server: run it locally.

- **Source code:** [github.com/bioleyl/jadis-examples/cooking-ssr](https://github.com/bioleyl/jadis-examples/tree/main/packages/cooking-ssr)
- **Guide:** [Server Rendering](../server-rendering/overview.md)

## Minesweeper

A fully playable Minesweeper game demonstrating:

- Complex component hierarchies
- Grid-based state management
- Event handling and DOM manipulation

- **Source code:** [github.com/bioleyl/jadis-examples/minesweeper](https://github.com/bioleyl/jadis-examples/tree/main/packages/minesweeper)
- **Live demo:** [bioleyl.github.io/jadis-examples/minesweeper](https://bioleyl.github.io/jadis-examples/minesweeper/)

## jlib

A component library built on *Jadis*, organised in atomic design, showing:

- Components that work as plain HTML tags and as typed classes in JSX
- Form fields that submit like native ones
- Theming through CSS custom properties, light and dark
- A documentation site, itself a *Jadis* app, with a live playground for each component

- **Source code:** [github.com/bioleyl/jlib](https://github.com/bioleyl/jlib)
- **Documentation:** [bioleyl.github.io/jlib](https://bioleyl.github.io/jlib/)

## Getting Started

Ready to build your own? Follow the [Installation Guide](./installation.md) to get up and running in minutes.
