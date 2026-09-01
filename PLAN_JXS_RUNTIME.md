# Plan: Lightweight JSX for Jadis

## Goal
Replace the `html` tagged template literal helper with a lightweight JSX implementation.
Consumers will use `<div>`, `<counter-component />`, `<></>` etc. instead of `` html`...` ``.

## Current State

| File | What it does |
|------|-------------|
| `src/helpers/template.helper.ts` | `html` (template literal DOM builder with markers) + `css` |
| `src/base-component.ts` | `Jadis` base class — no JSX props marker |
| `src/helpers/type.helper.ts` | Missing `RemoveIndexSignature` and `SafeElementValues` types |
| `dist/cjs/jsx-runtime.js` | JSX runtime exists in compiled form — no source in `src/` |
| `dist/cjs/index.js` | Exports both `html` AND `jsx` mixed together |

## Why No Race Condition?

`connectedCallback()` fires **after** class field initializers AND after `new Component()` sets props.

```
new Component()            ← props set here: this.count = props.count
  ↓
connectedCallback()         ← calls this.templateHtml()
  ↓                         ← `this.count` or `this._count.get()` is already available
```

Props flow: JSX `<Component prop={val} />` → `new Component()` → instance fields → `templateHtml()` reads them. No race.

---

## Phase 1 — Types (in source)

### Files changed
- `src/helpers/type.helper.ts` — add `RemoveIndexSignature<T>` and `SafeElementValues<T>`
- `src/base-component.ts` — add `static readonly __jadisProps: SafeElementValues<this>;` marker

### Why
The JSX type system needs a property on component classes to discover their prop types.
`__jadisProps` is the convention React uses, and TypeScript's JSX infrastructure looks for it.

---

## Phase 2 — JSX Runtime Source

### Files changed
- **`src/helpers/jsx-runtime.ts`** (NEW) — full JSX runtime with global `JSX` namespace
- **`src/helpers/jsx-dev-runtime.ts`** (NEW) — dev-only wrapper with `jsxDEV`

### Runtime functions
- `Fragment` — Symbol for `<></>` empty nodes
- `jsx(type, props, ...children)` → `Node`
- `jsxs` — alias
- `h` — alias
- `createVNode(tag, options)` — VNode factory for intrinsic elements
- `createComponentVNode(Component, options)` — VNode factory for custom elements
- `mountVNodes(parent, children)` — attach vnodes to a parent
- `renderToString(vnodes)` — SSR string rendering
- `hydrateSSR(root)` — hydrate SSR output

### Global JSX types
```ts
declare global {
  namespace JSX {
    type Element = any;
    interface ElementChildrenAttribute { children: unknown; }
    interface IntrinsicAttributes { ... }
    interface IntrinsicElements { [elementName: string]: Record<string, unknown>; }
    interface ElementAttributesProperty { __jadisProps: unknown; }
  }
}
```

### Function overloads for typed components
```ts
function jsx<T extends Jadis>(
  type: JadisConstructor<T>,
  props?: ComponentProps<T> & CommonJsxAttributes | null,
  ...children: unknown[]
): Node;
```

---

## Phase 3 — Remove old `html` helper

### Files changed
- `src/helpers/template.helper.ts` — remove `html`, keep `css`
- `src/index.ts` — remove `html`, add `jsx`, `jsxs`, `Fragment`, `createVNode`, `createComponentVNode`, `mountVNodes`, `renderToString`, `hydrateSSR`
- `src/tests/helpers/template.helper.test.ts` — remove `html` tests, keep `css` tests
- `rollup.config.mjs` — add `jsx-runtime.ts` and `jsx-dev-runtime.ts` as entry points

---

## Phase 4 — Update consumers

### Files changed
- `packages/create/templates/ts/src/components/Counter.ts`
- `packages/create/templates/ts/src/components/NameInput.ts`
- `packages/create/templates/ts/src/pages/main/MainPage.ts`
- `packages/create/templates/ts/src/pages/hello/HelloPage.ts`
- `packages/create/templates/ts/src/router.ts`
- `packages/create/templates/ts/src/main.ts`
- `packages/create/templates/js/...` — add `//@jsx jsx` pragma, convert to JSX

---

## Phase 5 — Update docs

### Files changed
- `packages/docs/pages/templating/create-template.md` — JSX examples
- `packages/docs/pages/templating/to-template.md` — JSX examples

---

## Rollup Config Changes

Add two new entry points:

```js
// JSX Runtime (ESM)
{ input: 'src/helpers/jsx-runtime.ts', output: { file: 'dist/esm/jsx-runtime.mjs' } }

// JSX Dev Runtime (ESM)
{ input: 'src/helpers/jsx-dev-runtime.ts', output: { file: 'dist/esm/jsx-dev-runtime.mjs' } }

// Same for CJS
{ input: 'src/helpers/jsx-runtime.ts', output: { file: 'dist/cjs/jsx-runtime.js' } }
{ input: 'src/helpers/jsx-dev-runtime.ts', output: { file: 'dist/cjs/jsx-dev-runtime.js' } }
```
