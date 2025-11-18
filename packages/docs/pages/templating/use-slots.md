# Use slots in a *Jadis* component

<!-- Slot à la main, ref vers toTemplate -->

In *Jadis*, much similar to how it works in web components, cou can use slots in your templates, so as to create more flexible components.

## Usage

It is very simple: you use a `slot` tag in the template where you want to populate
with content from elsewhere, like from another component. The content between both opening and
closing tags of your external component will be rendered inside the `<slot></slot>` tags.

:::code-group

```javascript
// MyComponent.js with a slot
export class MyComponent extends Jadis {
  static selector = createSelector('my-component');

  templateHtml(){ // [!code focus]
    return html`<div class="container"><slot></slot></div>`; // [!code focus]
  } // [!code focus]

  templateCss(){
    return css`
      .container {
        background-color: darkblue;
        color: white;
      }
    `;
  }
}

MyComponent.register();

```

```typescript
// MyComponent.ts with a slot
export class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  templateHtml(): DocumentFragment { // [!code focus]
    // [!code focus]
    return html`<div class="container"><slot></slot></div>`; // [!code focus] 
  } // [!code focus]

  templateCss(): string {
    return css`
      .container {
        background-color: darkblue;
        color: white;
      }
    `;
  }
}

MyComponent.register();
```

:::

Populate the slot

:::code-group

```javascript
// MainPage.js using MyComponent
class MainPage extends Jadis {
  static selector = createSelector('main-page');

  templateHtml() { // [!code focus]
    return html` <my-component><h1>My Title</h1><p>Hello there</p></my-component>`; // [!code focus]
  } // [!code focus]
}

MainPage.register();
```

```typescript
// MainPage.ts using MyComponent
class MainPage extends Jadis {
  static readonly selector = 'main-page';

  templateHtml(): DocumentFragment { // [!code focus]
    return html`<my-component><h1>My Title</h1><p>Hello there</p></my-component>`; // [!code focus]
  } // [!code focus]
}

MainPage.register();
```

:::

The `<h1>` and the `<p>` elements will be rendered through the MainPage component using the MyComponent component.

## Named slots

If you need to use several slots in the same component, just name them!

:::code-group

```javascript
// MyComponent.js with 2 slots
templateHtml() {
  return html`
    <div class='container'>
        <slot></slot>
        <slot name='article'></slot>
    </div>
  `
}

// Using MyComponent in MainPage.js
templateHtml() {
  return html`
    <my-component>
      <h1>My Title</h1>
      <p>Hello there</p>
      <div slot='article'>
        My article content is good.
      </div>
    </my-component>
  `
}
```

```typescript

// MyComponent.ts with 2 slots
templateHtml(): DocumentFragment {
  return html`
    <div class='container'>
      <slot></slot>
      <slot name='article'></slot>
    </div>
  `
}

// Using MyComponent in MainPage.ts
templateHtml(): DocumentFragment {
    return html`
      <my-component>
        <h1>My Title</h1>
        <p>Hello there</p>
        <div slot='article'>
          My article content is good.
        </div>
      </my-component>
    `;
  }

```

:::

## Even easier With `toTemplate()`

See the [dedicated documentation](to-template.md) about the *Jadis* method `toTemplate()` which allows you to easily populate slots
in the template by passing directly your document fragment as a child of the component, along with attributes
and props.

## Example with `toTemplate()`

:::code-group

```javascript
// Using MyComponent in MainPage.js
class MainPage extends Jadis {
  static selector = createSelector('main-page');

  templateHtml() {
    return html`
      ${MyComponent.toTemplate(
        {},
        html`<h1>My Article Title</h1>
          <p>My article content</p>`
      )}
    `;
  }
}

MainPage.register();

// MyComponent.js definition with slots
export class MyComponent extends Jadis {
  static selector = createSelector('my-component');

  templateHtml() {
    return html`
      <div class='container'>
        <slot></slot>
        <slot name='article'></slot>
      </div>
    `;
  }
}

MyComponent.register();
```

```typescript
// Using MyComponent in MainPage.ts
class MainPage extends Jadis {
  static readonly selector = 'main-page';

  templateHtml(): DocumentFragment {
    return html`
      ${MyComponent.toTemplate(
        {},
        html`<h1>My Article Title</h1>
          <p>My article content</p>`
      )}
    `;
  }
}

MainPage.register();

// MyComponent.ts definition with slots
export class MyComponent extends Jadis {
  static readonly selector = 'my-component';

  templateHtml(): DocumentFragment {
    return html`
      <div class='container'>
        <slot></slot>
        <slot name='article'></slot>
      </div>
    `;
  }
}

MyComponent.register();
```

:::
