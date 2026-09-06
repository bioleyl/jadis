# Event Handling in *Jadis* with `this.on`

For typical DOM event listeners, *Jadis* offers a built-in `on` method that simplifies events handling. It automatically registers the event with the component's cleanup signal and removes it when the component disconnects, so you don't need to manage an `AbortSignal` manually.

## Signature

```typescript
this.on(<element>, <eventName>, <callback>)
```

### Parameters

- `element`: an `<HTMLElement>` on which a listener is added
- `eventName`: a string corresponding to the event name to listen to
- `callback`: a callback function invoked as the event is emitted

### Return value

- none
  
## Example

```tsx
class ButtonComponent extends Jadis {
  templateHtml(): Node {
    return <button>Click me</button>;
  }

  onConnect() {
    this.on(this.getElement('button'), 'click', () => {
      console.log('Button clicked!');
    });
  }
}
```
