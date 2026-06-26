# toTemplate()

The static `toTemplate()` method creates a component instance with optional props, attributes, and slotted content. It is the programmatic equivalent of writing the component tag in HTML.

## Signature

```typescript
static toTemplate<T extends Jadis>(
  this: JadisConstructor<T>,
  options?: OptionsWithProps<ElementValues<T>>,
  slotted?: DocumentFragment
): T;
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `options` | `OptionsWithProps` | An object with `props` and `attrs` sub-objects |
| `slotted` | `DocumentFragment` | Content to project into the component's slots |

### Return Value

An instance of the component, ready to be appended to the DOM.

## Basic Usage

```typescript
templateHtml(): DocumentFragment {
  return html`
    ${UserProfile.toTemplate()}
  `;
}
```

## With Props and Attributes

```typescript
templateHtml(): DocumentFragment {
  return html`
    ${UserProfile.toTemplate({
      props: { username: 'alice' },
      attrs: { theme: 'dark' }
    })}
  `;
}
```

This renders:

```html
<user-profile theme="dark" username="alice"></user-profile>
```

## With Slotted Content

```typescript
templateHtml(): DocumentFragment {
  return html`
    ${Card.toTemplate(
      {},
      html`
        <h2 slot="header">Welcome</h2>
        <p>This is slotted content.</p>
      `
    )}
  `;
}
```

## Props vs Attributes

| | `props` | `attrs` |
|---|---|---|
| **Target** | JavaScript properties on the element | HTML attributes |
| **Conversion** | Used as-is | Automatically converted to kebab-case |
| **Use for** | Direct property assignment | HTML attribute setting |

## See Also

- [Slots](./slots.md) — Content projection in Web Components.
- [createElement()](../api/create-element.md) — A lower-level alternative for creating any element.
