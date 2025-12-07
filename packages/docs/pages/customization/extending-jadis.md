# Extending Jadis for Your Own Purpose

Jadis is provided as an abstract class. You can easily extend it to provide your own custom features.

Here is an example of how you could add a `useLoading` helper to manage a DOM loading indicator.

## Creating Your Own Jadis Class

We will create a helper that takes an asynchronous function and executes a callback when the waiting is done.

This way, you can interact with the DOM easily using that callback.

```typescript
import { Jadis } from "@jadis/core";

type AsyncFn<T> = () => Promise<T>;

export abstract class CustomJadis extends Jadis {
  protected useLoading<T>(
    asyncFns: AsyncFn<T>,
    onLoadingChange: (loading: boolean) => void
  ): Promise<T> {
    this.executeCallback(() => onLoadingChange(true));

    const promise = asyncFns();
    promise.finally(this.executeCallback.bind(this, () => onLoadingChange(false)));
    return promise;
  }

  private executeCallback(callback: () => void) {
    if (this.isConnected) {
      callback();
    } else {
      this.onConnectActions.push(callback);
    }
  }
}
```

## Creating a Component with Your Custom Jadis

As soon as the component starts to load, `loadData` is called to avoid losing time. When the promise is resolved, the content is placed in the right location and the DOM used for loading is removed.

```typescript
import { html } from "@jadis/core";
import { CustomJadis } from "./custom-jadis";

export class CustomComponent extends CustomJadis {
  static readonly selector = 'custom-component';

  private _data = this.useLoading(
    this.loadData.bind(this),
    (loading) => {
      this._refs.loading.style.display = loading ? 'block' : 'none';
      this._refs.content.style.display = loading ? 'none' : 'block';
    }
  );

  private _refs = this.useRefs((ref) => ({
    loading: ref('.loading'),
    content: ref('.content'),
  }));

  async onConnect() {
    this._refs.content.textContent = await this._data;
  }

  templateHtml(): DocumentFragment {
    return html`
      <div class="loading">Loading ...</div>
      <div class="content"></div>
    `;
  }

  private async loadData(): Promise<string> {
    // Simulate an async data fetch
    return new Promise((resolve) => {
      setTimeout(() => resolve("Data loaded"), 2000);
    });
  }
}

CustomComponent.register();
```

## Conclusion

With your custom `useLoading` helper in place, managing loading states becomes simpler, more consistent, and far less repetitive across your components. This small addition already brings cleaner UI logic and a smoother development experience.

Jadis is designed to be extended, so don’t hesitate to build more helpers that match the way you like to work. Each utility you add helps shape a component architecture that feels more expressive, more maintainable, and uniquely tailored to your project’s needs.