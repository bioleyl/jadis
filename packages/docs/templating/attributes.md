# Working with attributes using `useAttributes`

The `useAttributes` method defines a set of getters to simplify attribute management. It helps avoid misspelling them when you need to access them multiple times. It can also register callbacks for attribute changes.

:::info
The getters returned by `useAttributes` internally rely on the [getAttribute](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute) method. Each time you access one of these getters, the method is called behind the scenes to retrieve the current attribute value.
:::

## Signature

```typescript
useAttributes(<callbacksObject>): <attributesObject>
```

### Parameters

- `callbacksObject`: An object mapping attribute names to callbacks receiving `(value, oldValue)`.

Attribute changes are observed automatically when the component is connected:

- When the component connects, each callback runs **synchronously** for its attribute if the attribute is set (with `oldValue` `null`). There is no need to apply the value again in `onConnect()`.
- Later changes are delivered **asynchronously**, batched by a `MutationObserver`.
- The callbacks run again on each reconnection, for the attributes currently set.

Do not declare `static observedAttributes`: the callbacks object is the list of observed attributes.

:::warning JSX props are not attributes
`<hello-page name="Ada" />` sets the `name` **property**, so the `name` callback does not run. Pass attributes through the `attrs` prop, call `setAttribute`, or let the router set them (route parameters are attributes):

```tsx
<hello-page attrs={{ name: 'Ada' }} />
```
:::

### Return value

- An object whose keys are getters for the corresponding attributes.

## Attribute change callbacks

```typescript
import { Jadis } from '@jadis/core';

class Greeting extends Jadis {
  static readonly selector = 'greeting-component';

  readonly attrs = this.useAttributes({
    name: (value, oldValue) => {
      console.log(`Name changed from ${oldValue} to ${value}`);
    },
  });
}
```

## Examples

::: code-group

```jsx
/// <reference types="@jadis/core/jsx-runtime" />
/** @jsxImportSource @jadis/core */

import { createSelector, Jadis } from '@jadis/core';

export default class HelloPage extends Jadis {
  static selector = createSelector('hello-page');

  refs = this.useRefs((ref) => ({
    name: ref('span'),
  }));

  attrs = this.useAttributes({
    name: (value) => {
      this.refs.name.textContent = value ?? '';
    },
  });

  templateHtml() {
    return <h1>Hello, <span></span>!</h1>;
  }
}

HelloPage.register();
```

```tsx
import { Jadis } from '@jadis/core';

export default class HelloPage extends Jadis {
  static readonly selector = 'hello-page';

  readonly refs = this.useRefs((ref) => ({
    name: ref('span'),
  }));

  readonly attrs = this.useAttributes({
    name: (value) => {
      this.refs.name.textContent = value ?? '';
    },
  });

  templateHtml(): Node {
    return <h1>Hello, <span></span>!</h1>;
  }
}

HelloPage.register();
```

:::
