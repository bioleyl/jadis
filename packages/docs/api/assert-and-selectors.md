# `assert()` and `isComponentSelector()`

Two small helpers the library uses itself, exported for your own validation code.

## Import

```typescript
import { assert, isComponentSelector } from '@jadis/core';
```

## `assert()`

Narrows a condition for TypeScript and throws when it fails at runtime.

### Signature

```typescript
assert(condition: unknown, message: string): asserts condition;
```

| Parameter | Type | Description |
|---|---|---|
| `condition` | `unknown` | The condition that must hold |
| `message` | `string` | The message of the thrown `Error` |

Because it declares `asserts condition`, the compiler treats the condition as true on the lines that follow:

```typescript
import { assert, Jadis } from '@jadis/core';

class Chart extends Jadis {
  static readonly selector = 'data-chart';

  onConnect() {
    const canvas = this.shadowRoot?.querySelector('canvas');
    assert(canvas, 'Chart template is missing its canvas');
    // canvas is an Element here, not Element | undefined
    canvas.setAttribute('width', '600');
  }
}
```

:::info Always thrown
Unlike a bare-metal `console.assert` or an optimiser's `invariant`, this check is never compiled away. Use it for the conditions your own code produces — a template you forgot to update, an option you require — and handle user input with ordinary checks and an error message.
:::

## `isComponentSelector()`

Reports whether a string is a usable custom element name, without throwing.

### Signature

```typescript
isComponentSelector(key: string): key is ComponentSelector;
```

Returns `true` when the name starts with a lowercase letter, holds lowercase letters, digits, `.` and `_`, and joins its parts with single hyphens. The names HTML reserves for SVG and MathML are refused.

| Returns | Examples |
|---|---|
| `true` | `my-card`, `app.shell-v2_beta`, `x-1` |
| `false` | `div` (no hyphen), `-bad`, `bad-`, `my--card`, `My-Card`, `font-face` |

Use it when the name arrives at runtime — a plugin registry, a CMS field — and you want to branch rather than crash. [`createSelector()`](./create-selector.md) is the same test with a throw at the end.

```typescript
import { isComponentSelector } from '@jadis/core';

for (const [name, component] of Object.entries(pluginComponents)) {
  if (!isComponentSelector(name)) {
    console.warn(`Skipping plugin component "${name}": not a valid custom element name`);
    continue;
  }
  customElements.define(name, component);
}
```

## See also

- [`createSelector()`](./create-selector.md) — the throwing form.
- [VNodes](../templating/vnodes.md) — `createVNode()`, `createComponentVNode()` and `mountVNodes()`.
