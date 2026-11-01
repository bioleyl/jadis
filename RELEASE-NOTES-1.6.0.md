# @jadis/core v1.6.0

You can now listen to a component's events straight from JSX, and moving a component no longer resets it. The router can follow links and tells you when the route changes. JSX also builds elements about 40% faster.

## New

### Component events in JSX

You can listen to a component's declared `events` with `on` props, which are typed from those events. The handler gets the event's detail.

```tsx
<TodoRow onDelete={() => this.remove(item)} onValueChange={(value) => this.rename(item, value)} />
```

The listener stays as long as the element exists.

### Moving a component keeps it as it was

Moving a connected component no longer calls `onDisconnect` and then `onConnect`. This holds for `append`, `insertBefore`, `replaceChildren` and `moveBefore`. The component keeps its listeners, its `killSignal` and its state, so you can reorder a list without rebuilding its rows.

### Router

- **`match(path)`** tells you which route a path leads to, with its parameters, without navigating.
- **`gotoPath(path)` and `replacePath(path)`** navigate to a path written as a string.
- **`replace(name, ...params)`** works like `goto` but replaces the current history entry. Back goes to the page before it.
- **`router.bus`** sends `change` with the active route each time a route is shown.
- **`links: true`** makes the router follow clicks on links to its own paths, including links inside shadow roots. The browser still handles:
  - clicks with a modifier key
  - links with a `target`, `download` or `rel="external"`
  - links to other origins
  - paths that match no route
- **`mountOn(element, { show })`** lets you choose how a page takes the previous one's place, for example to add a transition. The default is `replaceChildren`.

### Translations

- **Dotted keys are refused by the type checker.** A dot joins a group and its key, so write the group instead.
- **The translator writes `<html lang>`** for the starting language too.

## Faster

- **JSX builds elements about 40% faster.** Building 1,000 rows went from 7.9 ms to 4.7 ms, because there are no more temporary arrays or copies.
- **Reordering a list takes 76% less time**, because moved components are no longer disconnected and connected again.
- **`match` finds a path's route in a single lookup.**

## Size

Gzipped, keeping only the code an app uses, compared with 1.5.1:

- Jadis alone: +61 B
- With JSX: +110 B
- With the router: +584 B, mostly for links (about 490 B) and the bus (182 B)
- With everything: +619 B
- The translator: unchanged

## Documentation

- **Benchmark:** a new page comparing Jadis 1.6 with React 19 and Vue 3.5 on speed, memory, start time and size, and explaining how it was measured.
- **Lifecycle:** a new section on moves.
- **Child to Parent and useEvents():** how to listen to events in JSX.
- **Routing:** links, the bus and custom page swaps.
- **Writing Texts:** grouped keys.

## Upgrading

```bash
npm install @jadis/core@^1.6.0
```

Check these behavior changes:

- **Removal finishes one microtask later.** `killSignal` is aborted and `onDisconnect` runs on the next microtask, not during `remove()`. A test that checks right after removing an element needs to `await` a microtask first.
- **Moves no longer call `onConnect` or `onDisconnect`.** If your code reset something on a move, move that reset elsewhere.
- **On a component, an `on` prop listens to its name with only the first letter lowercased**, so `onValueChange` listens to `valueChange`. A camelCase DOM handler on a component, like `onKeyDown`, now listens to `keyDown`; write `onkeydown` instead. On standard elements, the whole name is still lowercased.
- **Dotted translation keys are now a type error.**
- **`setLocale` writes `<html lang>` even when that locale is already showing.**

## Installation

```bash
npm install @jadis/core@1.6.0
```

---

# @jadis/create v1.17.0

## Changed

- **New projects start on `@jadis/core` 1.6.0.** The TypeScript and JavaScript templates depend on `^1.6.0`. The vanilla template's import map loads `https://esm.sh/@jadis/core@1.6.0`.

With Jadis 1.6, a new project gets:

- component events in JSX
- components that keep their state when moved
- a router that can follow links and announce changes
- faster JSX

## Usage

```bash
npm create @jadis@1.17.0
```
