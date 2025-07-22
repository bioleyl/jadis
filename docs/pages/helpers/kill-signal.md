# 🧨 The Kill Signal

Every Jadis component provides an internal `AbortSignal` called `killSignal`. This signal is triggered automatically when the component is removed from the DOM, allowing you to safely clean up resources such as event listeners, intervals, or external subscriptions.

Here’s how you might use it to bind a DOM event:

```javascript
class ButtonComponent extends Jadis {
  static template = html`<button>Click me</button>`;

  onConnect() {
    this.getElement('button').addEventListener(
      'click',
      () => console.log('Button clicked!'),
      { signal: this.killSignal }
    );
  }
}
```

## 💡 Note

For typical DOM event listeners, Jadis offers a built-in `on` method that simplifies this even further. It automatically registers the event and cleans it up when the component unmounts — so you don’t need to worry about the signal manually.

```javascript
class ButtonComponent extends Jadis {
  static template = html`<button>Click me</button>`;

  onConnect() {
    this.on(this.getElement('button'), 'click', () => {
      console.log('Button clicked!');
    });
  }
}
```
