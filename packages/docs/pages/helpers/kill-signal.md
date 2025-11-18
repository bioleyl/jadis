# The Kill Signal Helper

Every *Jadis* component provides an internal `AbortSignal` called `killSignal`. This signal is triggered automatically when the component is removed from the DOM, allowing you to safely clean up resources such as event listeners, intervals, or external subscriptions.

## Signature

```typescript
this.killSignal(): AbortSignal;
```

### Parameters

- none

### Return value

- An Abort signal:`<AbortSignal>` for this component

## Example

Here’s how you might use it to bind a DOM event:

```javascript
class ButtonComponent extends Jadis {
  templateHtml() {
    return html`<button>Click me</button>`;
  }

  onConnect() {
    this.getElement('button').addEventListener(
      'click',
      () => console.log('Button clicked!'),
      { signal: this.killSignal }
    );
  }
}
```

:::tip
Check out the event handling documentation, specifically the [`on` method](../templating/event-handling.md), for an easy way to register and clean up events in the DOM with *Jadis*
:::
