# From parent to child

Communication from a parent to its child component isn’t event-based. Instead, it follows a **direct control model**: the parent typically knows what the child needs in order to function properly and interacts with it accordingly.

## Method Calls

The most straightforward way for a parent to interact with a child is by calling its **public methods** or **setters**.

::: code-group

```javascript
import { Jadis, html, createSelector } from '@jadis/core';

class ChildComponent extends Jadis {
  static selector = createSelector('child-component');

  templateHtml() {
    return html`<p></p>`;
  }

  set textValue(value) {
    this.getElement('p').textContent = value;
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  refs = this.useRefs((ref) => ({
    childComponent: ref('child-component'),
  }));

  templateHtml() {
    return html`<child-component></child-component>`;
  }

  onConnect() {
    this.refs.childComponent.textValue = 'Hello from Parent Component!';
  }
}

ChildComponent.register();
ParentComponent.register();
```

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
    childComponent: ref<ChildComponent>('child-component'),
  }));

  templateHtml(): DocumentFragment {
    return html`<child-component></child-component>`;
  }

  onConnect(): void {
    this.refs.childComponent.textValue = 'Hello from Parent Component!';
  }
}

ChildComponent.register();
ParentComponent.register();
```

```javascript [js-doc]
// @ts-check
import { Jadis, html, createSelector } from '@jadis/core';

class ChildComponent extends Jadis {
  static selector = createSelector('child-component');

  templateHtml() {
    return html`<p></p>`;
  }

  /** @param {string} value */
  set textValue(value) {
    this.getElement('p').textContent = value;
  }
}

class ParentComponent extends Jadis {
  static selector = createSelector('parent-component');

  refs = this.useRefs((ref) => ({
    /** @type {ChildComponent} */
    childComponent: ref('child-component'),
  }));

  templateHtml() {
    return html`<child-component></child-component>`;
  }

  onConnect() {
    this.refs.childComponent.textValue = 'Hello from Parent Component!';
  }
}

ChildComponent.register();
ParentComponent.register();
```

:::
