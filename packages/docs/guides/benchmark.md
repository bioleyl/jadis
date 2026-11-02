---
pageClass: benchmark
---

# Benchmark

How Jadis compares with React and Vue on the operations of the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): creating, updating and removing the rows of a table, the memory it takes, the time to start, and the size of what the browser downloads.

In short, on this machine: Jadis 1.8 and Vue 3.5 are both well ahead of React 19. Jadis is the fastest on 5 of the 9 operations at full speed, and on 8 with the CPU slowed; Vue on 3 at full speed, creating 1,000 rows first among them, and React on selecting a row, by less than a millisecond. With 10,000 rows Jadis's JavaScript heap is 9 to 10 times smaller than Vue's and React's, it starts first, and it ships 5 times less code than Vue and 16 times less than React.

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

**Jadis 1.8**: one component renders its template once, creates each row's elements with JSX, and from then on changes them in place. One listener on the table handles the clicks of every row.

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

| Operation | React 19 | Vue 3.5 | Jadis 1.8 |
|---|---|---|---|
| Create 1,000 rows | 45.4 ms | **38.2 ms** | 42.4 ms |
| Replace all 1,000 rows | 48.2 ms | 38.8 ms | **37.7 ms** |
| Update every 10th row of 1,000 | 18.2 ms | 15.6 ms | **14.4 ms** |
| Select a row | **3.0 ms** | 4.9 ms | 3.4 ms |
| Swap 2 rows of 1,000 | 42.8 ms | **6.8 ms** | 7.5 ms |
| Remove a row | 10.7 ms | 11.2 ms | **9.7 ms** |
| Create 10,000 rows | 580.0 ms | 442.3 ms | **418.0 ms** |
| Append 1,000 rows to 1,000 | 76.4 ms | **44.9 ms** | 45.4 ms |
| Clear 1,000 rows | 8.5 ms | 4.8 ms | **4.0 ms** |

With the CPU slowed 4 times, as the js-framework-benchmark does to tell small operations apart, median of 10 runs:

| Operation | React 19 | Vue 3.5 | Jadis 1.8 |
|---|---|---|---|
| Create 1,000 rows | 216.1 ms | 205.1 ms | **167.7 ms** |
| Replace all 1,000 rows | 193.6 ms | 171.5 ms | **170.9 ms** |
| Update every 10th row of 1,000 | 71.7 ms | 65.5 ms | **61.7 ms** |
| Select a row | 9.6 ms | 5.9 ms | **2.4 ms** |
| Swap 2 rows of 1,000 | 164.4 ms | 27.2 ms | **24.6 ms** |
| Remove a row | 39.2 ms | 38.5 ms | **36.7 ms** |
| Create 10,000 rows | 2,411.6 ms | 1,809.3 ms | **1,685.7 ms** |
| Append 1,000 rows to 1,000 | 217.0 ms | **200.2 ms** | 207.3 ms |
| Clear 1,000 rows | 26.7 ms | 23.9 ms | **16.9 ms** |

Vue creates 1,000 rows first at full speed, Jadis with the CPU slowed. Creating rows is mostly the browser's layout and paint, the same work for all three, and the Jadis table sits in a shadow root, which the browser takes longer to lay out and paint: the same app without one (`useShadowDom = false`) laid out and painted 1,000 new rows in about 8% less time. Jadis's own script is the faster one, so it comes first when the CPU is slowed and the script weighs more.

## Memory

The JavaScript heap after a garbage collection, median of 7. The smallest of each moment is in green.

| Moment | React 19 | Vue 3.5 | Jadis 1.8 |
|---|---|---|---|
| Page ready | 1.54 MB | 1.29 MB | **1.13 MB** |
| With 1,000 rows | 3.71 MB | 3.28 MB | **1.36 MB** |
| With 10,000 rows | 20.43 MB | 19.04 MB | **2.13 MB** |
| After 5 creations and clearings of 1,000 rows | 2.32 MB | 1.59 MB | **1.34 MB** |

With 10,000 rows, Jadis's heap is 9 times smaller than Vue's and nearly 10 times smaller than React's. React and Vue keep objects for each row (fibers, virtual nodes), so their heap grows with the table: 10,000 rows add 19 MB to React's and 18 MB to Vue's. Jadis's rows are DOM elements, outside the JavaScript heap: 10,000 rows add 1 MB, the app's own list of rows, which points at each row's elements.

The last line is no leak. Each library ends a little above its start once its code has run many times: the browser keeps the code it optimized, and its caches. The heap then stays flat: measured again over 100 creations and clearings of 1,000 rows, Jadis's heap stopped growing after the first 5, at about 1.3 MB, with as many DOM elements and event listeners as when the page was ready.

The heap is what each library adds. The elements themselves live outside it, the same 100,000 DOM nodes for the three with 10,000 rows, and they weigh more: the whole tab then took 191.6 MB with Jadis, against 209.1 MB with React and 209.6 MB with Vue. The DOM makes up most of it, and the difference between the three is the heap above.

## Size and start

| | React 19 | Vue 3.5 | Jadis 1.8 |
|---|---|---|---|
| The app's bundle, minified and gzipped | 70.2 kB | 23.0 kB | **4.3 kB** |
| Page load to the app's first frame | 54.9 ms | 25.9 ms | **24.0 ms** |
| The same, CPU slowed 4 times | 128.5 ms | 67.6 ms | **55.2 ms** |

## How it was measured

**Machine**: a laptop with an Intel Core i7-1255U (12 threads) and 15 GB of memory, on Ubuntu 22.04 under WSL2 (Linux 6.18), the speed measured on 1 November 2026, the memory and the start on 2 November. A laptop's speed drifts with its heat and its power, and under WSL a process runs on its fast or its efficient cores: compare the columns, not these figures with another machine's.

**Browser**: Chromium 153 without a window (headless), driven by Playwright 1.63, each page served from a local server.

**Builds**: each app is built for production and minified, as one ES module loaded by one `<script type="module">`.

- React: bundled with esbuild 0.28, `process.env.NODE_ENV` set to `"production"`.
- Vue: built with Vite 7.3 and `@vitejs/plugin-vue` 6.0, without the Options API (`__VUE_OPTIONS_API__: false`), which the app does not use and Vue's documentation advises dropping.
- Jadis: bundled with esbuild 0.28.

**An operation's time**: each run opens a fresh page, waits for the app to show, then warms it up: 5 times, it creates 1,000 rows and clears them. It then sets up what the operation needs (1,000 rows, for an update), and times one click: from just before `click()` until the browser has painted the next frame (a `setTimeout` started in a `requestAnimationFrame` callback runs once that frame is painted). The time holds the script, the layout and the paint. Each operation is measured for the three frameworks one after the other, in an order that turns from one run to the next, so a machine that slows down during the runs weighs on all three alike; the median of the runs is kept.

**The CPU slowed 4 times**: the DevTools protocol's `Emulation.setCPUThrottlingRate`, as the js-framework-benchmark uses for the operations that take only a few milliseconds.

**Memory**: each reading in a browser of its own, median of 7, after two garbage collections forced through the DevTools protocol. The `JSHeapUsedSize` metric gives the JavaScript heap only: the three apps create the same elements, so the difference is each library's own bookkeeping. The whole tab is the renderer process's proportional set size (PSS), read from Linux.

**Start**: from the start of the page load to the first frame painted after the app's first render, timed by the page itself; median of 40 page loads, 30 with the CPU slowed.

**Size**: each bundle, minified, compressed with gzip at level 9; a kB is 1,000 bytes. Jadis's holds the code that takes over a page rendered on the server, new in 1.7, and the stylesheet shared between instances (0.3 kB: 1.7.0's bundle was 4.0 kB).

## Reading it fairly

- An operation that takes one or two frames (select, swap, clear) moves from one run to the next by a few milliseconds, depending on when the frame comes: only differences much larger than that tell. The large ones hold in every run: React behind on swapping rows and creating 10,000 of them, and the memory, the size and the start.
- This compares ways of writing an app as much as libraries. Jadis is fast here because it changes the rows it has in place, where React draws again and compares, and Vue tracks what changed. A Jadis app that built its whole list again at each change, or made each row a component of its own, would cost more; that is not measured here.
- The Jadis component sets `:host { display: block; }`, as the [Styles](../templating/css.md) page advises: without it, a custom element is inline, and laying out a table inside an inline element made selecting a row slower than in React.
- A first series of runs measured all operations of one framework before the next; the machine slowed down along the way and the results came out unequal. The runs above measure each operation for the three frameworks back to back.
- One browser, one machine. Other browsers, and server rendering, are not measured.
- Jadis 1.7.0 was measured in the same runs. The speed stayed within what separates two copies of the same bundle measured side by side (up to 12% on an operation), and the memory within 0.01 MB. With the CPU slowed 4 times, 1.7.0 started in 44.0 ms, 11 ms sooner: creating the stylesheet that a component's instances share delays the first frame. At full speed the two start alike.

## See Also

- [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark): the operations measured here, and many other libraries.
- [Templates](./templates.md): rendering once, and updating the DOM yourself.
