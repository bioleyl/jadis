# Parent to Child

Communication from a parent component to its child is direct: the parent accesses the child instance and calls its public methods or setters. This follows the standard Web Components pattern of explicit, imperative control.

## Method Calls and Setters

The recommended approach is to expose setters or public methods on the child component:

```typescript
import { Jadis, html } from '@jadis/core';

class ChildComponent extends Jadis {
  static readonly selector = 'child-component';

  templateHtml(): DocumentFragment {
    return html`<p></p>`;
  }

  set textValue(value: string): void {
    this.getElement('p').textContent = value;
  }
}

class ParentComponent extends Jadis {
  static readonly selector = 'parent-component';

  readonly refs = this.useRefs((ref) => ({
    child: ref<ChildComponent>('child-component'),
  }));

  templateHtml(): DocumentFragment {
    return html`<child-component></child-component>`;
  }

  onConnect(): void {
    this.refs.child.textValue = 'Hello from Parent!';
  }
}

ChildComponent.register();
ParentComponent.register();
```

## Using `toTemplate()` with Props

When creating a child via `toTemplate()`, pass data through the `props` option:

```typescript
templateHtml(): DocumentFragment {
  return html`
    ${ChildComponent.toTemplate({
      props: { textValue: 'Hello from Parent!' }
    })}
  `;
}
```

## Best Practices

- Expose setters for simple value updates.
- Expose public methods for complex operations.
- Use `useRefs()` to get typed references to child components.
- Avoid direct DOM manipulation of child internals — use the child's public API.

## See Also

- [Child to Parent](./child-to-parent.md) — The reverse direction.
- [Cross-Component](./cross-components.md) — Communication between unrelated components.
