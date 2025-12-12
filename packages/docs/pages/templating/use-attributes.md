# Working with attributes using `useAttributes`

The `useAttributes` method defines a set of getters to simplify attribute management. It helps avoid misspelling them when you need to access them multiple times.

:::info
The getters returned by `useAttributes` internally rely on the [getAttribute](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute) method. Each time you access one of these getters, the method is called behind the scenes to retrieve the current attribute value.
:::

## Signature

```typescript
useAttributes(<attribute>, <attribute>, ...): <attributesObject>
```

### Parameters

- `attribute`: A `string` representing the attribute name. You can specify multiple attributes.

### Return value

- An object whose keys are getters for the corresponding attributes.

## Examples

::: code-group

```javascript
import { createSelector, html, Jadis } from '@jadis/core';

export default class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

  refs = this.useRefs((ref) => ({
    name: ref('span'),
  }));

  attrs = this.useAttributes('name');

  templateHtml() {
    return html`
      <h1>Hello, <span></span>!</h1>
    `;
  }

  onConnect() {
    const { name } = this.refs;

    name.textContent = this.attrs.name;
  }
}

HelloPage.register();
```

```typescript
import { html, Jadis } from '@jadis/core';

export default class HelloPage extends Jadis {
  static readonly selector = 'hello-page';

  readonly refs = this.useRefs((ref) => ({
    name: ref('span'),
  }));

  readonly attrs = this.useAttributes('name');

  templateHtml(): DocumentFragment {
    return html`
      <h1>Hello, <span></span>!</h1>
    `;
  }

  onConnect(): void {
    const { name } = this.refs;

    name.textContent = this.attrs.name ?? '';
  }
}

HelloPage.register();
```

:::