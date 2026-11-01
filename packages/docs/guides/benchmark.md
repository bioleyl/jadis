---
pageClass: benchmark
---

# Benchmark

How Jadis compares with React and Vue on the operations of the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, updating and removing the rows of a table, the memory it takes, the time to start, and the size of what the browser downloads.

In short, on this machine: Jadis 1.7 and Vue 3.5 are both well ahead of React 19. Jadis is the fastest on 6 of the 9 operations at full speed, and on 7 with the CPU slowed; Vue on the others, creating 1,000 rows at full speed first among them. With 1,000 rows Jadis takes less than half the memory of either, it starts first, and it ships 6 times less code than Vue and 18 times less than React.

## The three apps

The three apps show the same table, from the same data, with the same buttons. Each is written the way its own documentation advises, as the js-framework-benchmark's keyed entries write them.

**React 19.3.1**: one reducer holds the rows, and each row is a memoized component, drawn again only when its item or its selection changes.

```jsx
case 'UPDATE': {
  const data = state.data.slice();
  for (let index = 0; index < data.length; index += 10) {
    data[index] = { id: data[index].id, label: `${data[index].label} !!!` };
  }
  return { data, selected: state.selected };
}
```

**Vue 3.5.44**: a single-file component with `<script setup>`; the rows are a `shallowRef`, drawn by a keyed `v-for` whose `v-memo` skips the rows that did not change.

```js
function update() {
  const current = rows.value;
  for (let index = 0; index < current.length; index += 10) {
    current[index].label += ' !!!';
  }
  setRows();
}
```

**Jadis 1.7**: one component renders its template once, creates each row's elements with JSX, and from then on changes them in place. One listener on the table handles the clicks of every row.

```tsx
private update(): void {
  for (let index = 0; index < this.rows.length; index += 10) {
    this.rows[index].label.data += ' !!!';
  }
}
```

The three use one generator for the labels, seeded, so they draw the same rows.

## Speed

From the click to the next frame painted, median of 15 runs. The fastest of each operation is in green.

| Operation | React 19 | Vue 3.5 | Jadis 1.7 |
|---|---|---|---|
| Create 1,000 rows | 44.2 ms | **38.4 ms** | 43.6 ms |
| Replace all 1,000 rows | 68.1 ms | 38.2 ms | **38.0 ms** |
| Update every 10th row of 1,000 | 20.8 ms | 14.6 ms | **14.1 ms** |
| Select a row | 2.8 ms | **2.7 ms** | 3.0 ms |
| Swap 2 rows of 1,000 | 39.3 ms | **6.5 ms** | 7.1 ms |
| Remove a row | 14.3 ms | 10.7 ms | **9.3 ms** |
| Create 10,000 rows | 569.1 ms | 452.1 ms | **420.6 ms** |
| Append 1,000 rows to 1,000 | 76.9 ms | 49.6 ms | **45.2 ms** |
| Clear 1,000 rows | 9.4 ms | 4.7 ms | **4.0 ms** |

With the CPU slowed 4 times, as the js-framework-benchmark does to tell small operations apart, median of 10 runs:

| Operation | React 19 | Vue 3.5 | Jadis 1.7 |
|---|---|---|---|
| Create 1,000 rows | 222.8 ms | 204.6 ms | **192.7 ms** |
| Replace all 1,000 rows | 228.1 ms | 185.0 ms | **178.5 ms** |
| Update every 10th row of 1,000 | 79.7 ms | 77.5 ms | **68.2 ms** |
| Select a row | 10.2 ms | 10.9 ms | **7.0 ms** |
| Swap 2 rows of 1,000 | 173.8 ms | **28.6 ms** | 30.6 ms |
| Remove a row | 44.0 ms | 45.9 ms | **34.4 ms** |
| Create 10,000 rows | 2,638.1 ms | 2,007.0 ms | **1,786.5 ms** |
| Append 1,000 rows to 1,000 | 232.3 ms | **213.9 ms** | 227.3 ms |
| Clear 1,000 rows | 30.3 ms | 19.9 ms | **17.1 ms** |

Vue creates 1,000 rows first at full speed, Jadis with the CPU slowed. Creating rows is mostly the browser's layout and paint, the same work for all three, and the Jadis table sits in a shadow root, which the browser takes longer to lay out and paint: the same app without one (`useShadowDom = false`) laid out and painted 1,000 new rows in about 8% less time. Jadis's own script is the faster one, so it comes first when the CPU is slowed and the script weighs more.

## Memory

The JavaScript heap after a garbage collection, median of 5.

| Moment | React 19 | Vue 3.5 | Jadis 1.7 |
|---|---|---|---|
| Page ready | 1.55 MB | 1.30 MB | **1.12 MB** |
| With 1,000 rows | 3.74 MB | 3.29 MB | **1.33 MB** |
| After 5 creations and clearings of 1,000 rows | 2.37 MB | 1.61 MB | **1.41 MB** |

The last line is no leak. Each library ends a little above its start once its code has run many times: the browser keeps the code it optimized, and its caches. The heap then stays flat: measured again over 100 creations and clearings of 1,000 rows, Jadis's heap stopped growing after the first 5, at 1.33 MB, with as many DOM elements and event listeners as when the page was ready. React and Vue keep an object for each row (fibers, virtual nodes), which is why their middle line is the highest; Jadis's rows are DOM elements, outside the JavaScript heap, so its middle line is barely above its first, and below its last.

## Size and start

| | React 19 | Vue 3.5 | Jadis 1.7 |
|---|---|---|---|
| The app's bundle, minified and gzipped | 70.2 kB | 23.1 kB | **4.0 kB** |
| Page load to the app's first frame | 67.5 ms | 31.6 ms | **26.6 ms** |
| The same, CPU slowed 4 times | 147.8 ms | 67.0 ms | **42.6 ms** |

## How it was measured

**Machine**: a laptop with an Intel Core i7-1255U (12 threads) and 15 GB of memory, on Ubuntu 22.04 under WSL2 (Linux 6.18), measured on 31 October 2026. A laptop's speed drifts with its heat and its power, and under WSL a process runs on its fast or its efficient cores: compare the columns, not these figures with another machine's.

**Browser**: Chromium 153 without a window (headless), driven by Playwright 1.63, each page served from a local server.

**Builds**: each app is built for production and minified, as one ES module loaded by one `<script type="module">`.

- React: bundled with esbuild 0.28, `process.env.NODE_ENV` set to `"production"`.
- Vue: built with Vite 7.3 and `@vitejs/plugin-vue` 6.0, without the Options API (`__VUE_OPTIONS_API__: false`), which the app does not use and Vue's documentation advises dropping.
- Jadis: bundled with esbuild 0.28.

**An operation's time**: each run opens a fresh page, waits for the app to show, then warms it up: 5 times, it creates 1,000 rows and clears them. It then sets up what the operation needs (1,000 rows, for an update), and times one click: from just before `click()` until the browser has painted the next frame (a `setTimeout` started in a `requestAnimationFrame` callback runs once that frame is painted). The time holds the script, the layout and the paint. Each operation is measured for the three frameworks one after the other, in an order that turns from one run to the next, so a machine that slows down during the runs weighs on all three alike; the median of the runs is kept.

**The CPU slowed 4 times**: the DevTools protocol's `Emulation.setCPUThrottlingRate`, as the js-framework-benchmark uses for the operations that take only a few milliseconds.

**Memory**: after two garbage collections forced through the DevTools protocol, the `JSHeapUsedSize` metric: the JavaScript heap only. The three apps create the same elements, so the difference is each library's own bookkeeping.

**Start**: from the start of the page load to the first frame painted after the app's first render, timed by the page itself.

**Size**: each bundle, minified, compressed with gzip at level 9; a kB is 1,000 bytes. Measured again on 1 November 2026, the three bundles with one method: Jadis's holds the code that takes over a page rendered on the server, new in 1.7 (0.2 kB: 1.6's bundle was 3.8 kB).

## Reading it fairly

- An operation that takes one or two frames (select, swap, clear) moves from one run to the next by a few milliseconds, depending on when the frame comes: only differences much larger than that tell. The large ones hold in every run: React behind on swapping rows and creating 10,000 of them, and the memory, the size and the start.
- This compares ways of writing an app as much as libraries. Jadis is fast here because it changes the rows it has in place, where React draws again and compares, and Vue tracks what changed. A Jadis app that built its whole list again at each change, or made each row a component of its own, would cost more; that is not measured here.
- The Jadis component sets `:host { display: block; }`, as the [Styles](../templating/css.md) page advises: without it, a custom element is inline, and laying out a table inside an inline element made selecting a row slower than in React.
- A first series of runs measured all operations of one framework before the next; the machine slowed down along the way and the results came out unequal. The runs above measure each operation for the three frameworks back to back.
- One browser, one machine. Other browsers, and server rendering, are not measured.
- The speed, the memory and the start above were measured with Jadis 1.6. Measured again on 1 November 2026 against 1.7, 25 runs of each operation, both stayed within what separates two copies of the same 1.6 bundle measured side by side (up to 12% on an operation), and took the same memory to the byte.

## See Also

- [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): the operations measured here, and many other libraries.
- [Templates](./templates.md): rendering once, and updating the DOM yourself.
