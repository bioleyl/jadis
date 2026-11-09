# Setup

How a Jadis project starts, with or without a build step, and how its files are laid out.

## Contents

- Scaffolded projects
- Vite, TypeScript and JSX by hand
- Checked JavaScript with JSX
- No build step
- Project layout
- Before you finish

## Scaffolded projects

```bash
npx @jadis/create ts my-app        # TypeScript, Vite, JSX, a router and two pages
npx @jadis/create js my-app        # JavaScript checked by TypeScript, Vite, JSX
npx @jadis/create ssr my-app       # TypeScript and JSX, pages rendered on the server by Fastify (@jadis/fastify)
npx @jadis/create vanilla my-app   # no bundler, no JSX: an import map and a CDN
```

```bash
cd my-app
npm install        # not for vanilla
npm run dev        # vanilla: serve the folder with any static HTTP server (npx serve .)
```

The scaffolds' code is a good model for file names and structure: read it before inventing a layout.

## Vite, TypeScript and JSX by hand

```bash
npm create vite@latest my-app -- --template vanilla-ts
cd my-app
npm install
npm install @jadis/core
```

1. `tsconfig.json`, under `compilerOptions`:

   ```json
   {
     "jsx": "react-jsx",
     "jsxImportSource": "@jadis/core",
     "strict": true,
     "target": "ES2020",
     "useDefineForClassFields": true
   }
   ```

   `react-jsx` names the automatic JSX transform; it does not need React. The compiler imports `@jadis/core/jsx-runtime` itself.
2. Files with JSX end in `.tsx` (`.jsx` in JavaScript). An entry without JSX can stay `main.ts` and import `.tsx` modules. Point `index.html` at the entry: `<script type="module" src="/src/main.tsx"></script>`.
3. Keep `src/vite-env.d.ts` with `/// <reference types="vite/client" />`: it types `import styles from './x.css?inline'` as a string.

```tsx
// src/main.tsx
import { Jadis } from '@jadis/core';

class AppShell extends Jadis {
  static readonly selector = 'app-shell';

  templateHtml(): Node {
    return <main><h1>My Jadis app</h1></main>;
  }

  templateCss(): string {
    return ':host { display: block; }';
  }
}

AppShell.register();
document.body.append(document.createElement('app-shell'));
```

## Checked JavaScript with JSX

`jsconfig.json`:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@jadis/core",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2020"
  },
  "include": ["src"]
}
```

In each `.jsx` file, `/// <reference types="@jadis/core/jsx-runtime" />` and `/** @jsxImportSource @jadis/core */` at the top help editors. Selectors use `createSelector('my-card')` so they are typed as selectors, events use a schema (`this.useEvents({ save: Object })`) or a JSDoc type, and buses a JSDoc type (`/** @type {Bus<{ notify: string }>} */`). See [components.md](components.md#plain-javascript).

## No build step

Browsers run neither JSX nor TypeScript. Two ways to skip the bundler:

**Plain JavaScript with `createElement`**, imported from a CDN through an import map:

```html
<script type="importmap">
  { "imports": { "@jadis/core": "https://esm.sh/@jadis/core@1.8.1" } }
</script>
<script type="module" src="/src/main.js"></script>
```

```js
// src/main.js
import { createElement, Jadis } from '@jadis/core';

class HelloWorld extends Jadis {
  static selector = 'hello-world';

  templateHtml() {
    return createElement('p', { props: { textContent: 'Hello without a build step' } });
  }
}

HelloWorld.register();
```

**TypeScript and JSX compiled by `tsc` alone**, the output served as it is:

```bash
npx tsc --jsx react-jsx --jsxImportSource @jadis/core --module ESNext --target ES2020 --outDir dist
```

The output imports `@jadis/core/jsx-runtime`, so the import map needs both entries:

```json
{
  "imports": {
    "@jadis/core": "https://esm.sh/@jadis/core@1.8.1",
    "@jadis/core/jsx-runtime": "https://esm.sh/@jadis/core@1.8.1/jsx-runtime"
  }
}
```

- Pin the CDN version to the one you develop against.
- Serve over HTTP: modules and import maps do not work from `file://`.
- Without Vite, `?inline` CSS imports do not exist: return the CSS from `templateCss()` as a string, or with the `css` tag.

## Project layout

The scaffolds use this shape; follow the project's own when it has one.

```
index.html
src/
  main.ts(x)               the entry: language, router, mount
  routes.ts                the route table (imports every page, which registers it)
  router.ts                the app's one Router, imported by what navigates
  components/              reusable components, one per file, CSS beside it
    quantity-stepper.tsx
    quantity-stepper.css
  pages/                   one component per route
    orders/
      orders-page.tsx
      orders-page.css
  layouts/                 root components of route groups
  services/                app state, rules and server calls: no DOM
  i18n/                    en.ts, fr.ts, i18n.ts
```

- One component per file, named after its selector or its class; `register()` at the bottom.
- A selector prefix per app or library (`app-`, `shop-`) keeps names unique when several libraries share a page.
- Business rules and server calls live in `services/`, free of DOM, so they can be tested without rendering; components show and report.

## Before you finish

- `npx tsc --noEmit` (or the project's `build`, which runs `tsc`) for the types, JSX props included.
- The tests ([testing.md](testing.md)).
- Open the page in a browser: timing, shadow DOM and styles are only certain there.
