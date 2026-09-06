# Write the DOM with `templateHtml()`

The `templateHtml()` method defines the HTML structure of the component. It is intended to be overridden by subclasses or component implementations that need to supply their own visual layout. When implemented, this method should return a `Node` containing the component's rendered HTML.

:::info Info: *Jadis* uses **JSX** for templating
Configure your `tsconfig.json` or `jsconfig.json` to enable JSX:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@jadis/core"
  }
}
```
:::

## Signature

```typescript
templateHtml?(): Node;
```

### Parameters

- none

### Return value

- `Node` Any DOM node (element, fragment, document fragment, etc.) representing the component's template.

## Example

Override this method in your component to provide a custom HTML template using JSX syntax.

:::code-group

```javascript
// Add these JSDoc pragmas at the top of your file:
// /// <reference types="@jadis/core/jsx-runtime" />
// /** @jsxImportSource @jadis/core */

templateHtml() {
  return (
    <div class="container">
      <p>Hello There</p>
    </div>
  );
}
```

```typescript
templateHtml(): Node {
  return (
    <div class="container">
      <p>Hello There</p>
    </div>
  );
}

```

:::

### Without JSX

JSX is optional. If you want to run Jadis directly in the browser without a JSX transform, use the `createElement` helper:

```typescript
import { createElement, Jadis } from '@jadis/core';

class HelloWorld extends Jadis {
  static readonly selector = 'hello-world';

  templateHtml(): Node {
    const fragment = document.createDocumentFragment();
    const heading = createElement('h1', {}, fragment);
    heading.textContent = 'Hello, Jadis!';

    const paragraph = createElement(
      'p',
      { props: { textContent: 'This component does not use JSX.' } },
      fragment
    );

    return fragment;
  }
}

HelloWorld.register();
```

`createElement` supports element properties, HTML attributes, and appending to a `DocumentFragment`, `ShadowRoot`, or regular element. See the [`createElement` helper documentation](../helpers/create-element.md) for more examples.

### Using Fragments

When your template has multiple root elements, wrap them in a fragment:

```typescript
templateHtml(): Node {
  return (
    <>
      <header>Header content</header>
      <main>Main content</main>
      <footer>Footer content</footer>
    </>
  );
}
```

### Using Jadis Components

You can embed other Jadis components directly in JSX:

```typescript
templateHtml(): Node {
  return (
    <div>
      <h1>Dashboard</h1>
      <user-profile user={this.userData} />
      <counter-component />
    </div>
  );
}
```

Props are passed as JSX attributes:

```typescript
templateHtml(): Node {
  return (
    <name-input
      label="Your name"
      placeholder="Enter your name"
      class="my-input"
    />
  );
}
```

## Notes on shadow DOM

By default, all *Jadis* components are rendered using a shadow DOM. This provides style and markup encapsulation, preventing unintended side effects from global CSS and ensuring predictable component behavior.

In some cases, it may be desirable to render a component without a Shadow DOM. This can be achieved by setting the static readonly property `useShadowDom` to `false`.

## When to disable the Shadow DOM

Disabling the Shadow DOM is recommended in the following scenarios:

- **Global styling requirements**: when a component must inherit styles from a global stylesheet or a CSS framework that relies on global selectors.
- **Integration with third party libraries**: when using libraries or scripts that expect direct access to the DOM tree and do not support Shadow DOM boundaries.
- **Progressive enhancement or legacy environments**: when building components intended to enhance existing markup or integrate into legacy codebases where Shadow DOM usage is not feasible.
- **SEO or tooling constraints**: when specific tools, crawlers, or testing utilities do not fully support Shadow DOM and require access to the light DOM.

### Example without a Shadow DOM

```typescript
export class TestComponentNoShadow extends Jadis {
  static readonly selector = 'test-no-shadow';
  static readonly useShadowDom = false;

  templateHtml(): Node {
    return <div>Hello</div>;
  }
}

TestComponentNoShadow.register();
```
