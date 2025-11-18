# Write the DOM with `templateHTML()`

The `templateHtml()` method defines the HTML structure of the component. It is intended to be overridden by subclasses or component implementations that need to supply their own visual layout. When implemented, this method should return a `DocumentFragment` containing the component’s rendered HTML.

## Signature

```typescript
templateHtml?(): DocumentFragment;
```

### Parameters

- none
  
### Return value

- `DocumentFragment` A fragment representing the component’s HTML template.
This enables efficient DOM manipulation, as `DocumentFragment` can be constructed and modified without triggering layout or rendering until it is inserted into the document.

## Example

Override this method in your component to provide a custom HTML template. Typically, you will create a `DocumentFragment` manually or by inserting other *Jadis* components.

:::code-group

```javascript
templateHtml(){
    return html`
      <div class="container">
        <p>Hello There</p>
      </div>
    `;
  }
```

```typescript
templateHtml(): DocumentFragment{
    return html`
      <div class="container">
        <p>Hello There</p>
      </div>
    `;
  }

```

:::
