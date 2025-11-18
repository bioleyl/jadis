# Event Handling in *Jadis* with `this.on`

For typical DOM event listeners, *Jadis* offers a built-in `on` method that simplifies events handling. It automatically registers the event and cleans it up when the component unmounts — so you don’t need to worry about the signal manually.

## Signature

```typescript
this.on(element<HTMLElement>, event<Event>, callback<(event) => {}>)
```

### Parameters

- `element`: an `<HTMLElement>` on which a listener is added
- `event`: an `<HTMLElementEvent>` to listen for
- `callback`: a callback function invoked as the event is emitted

### Return value

- none

```javascript
class ButtonComponent extends Jadis {
  templateHtml() {
    return html`<button>Click me</button>`;
  }

  onConnect() {
    this.on(this.getElement('button'), 'click', () => {
      console.log('Button clicked!');
    });
  }
}
```
