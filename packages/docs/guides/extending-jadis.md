# Extending Jadis

Jadis is designed to be extended. Since it is provided as an abstract class, you can create your own base class with custom helpers that match your project's patterns and conventions.

## Creating a Custom Base Class

Extend `Jadis` to add reusable helpers:

```typescript
import { Jadis } from '@jadis/core';

type AsyncFn<T> = () => Promise<T>;

export abstract class CustomJadis extends Jadis {
  protected useLoading<T>(
    asyncFn: AsyncFn<T>,
    onLoadingChange: (loading: boolean) => void
  ): Promise<T> {
    this.executeCallback(() => onLoadingChange(true));

    const promise = asyncFn();
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

## Using the Custom Base Class

Components that extend `CustomJadis` inherit all of Jadis's functionality plus your custom helpers:

```typescript
import { html } from '@jadis/core';
import { CustomJadis } from './custom-jadis';

class DataComponent extends CustomJadis {
  static readonly selector = 'data-component';

  private readonly data = this.useLoading(
    this.loadData.bind(this),
    (loading) => {
      this.refs.loading.style.display = loading ? 'block' : 'none';
      this.refs.content.style.display = loading ? 'none' : 'block';
    }
  );

  private readonly refs = this.useRefs((ref) => ({
    loading: ref('.loading'),
    content: ref('.content'),
  }));

  templateHtml(): DocumentFragment {
    return html`
      <div class="loading">Loading...</div>
      <div class="content"></div>
    `;
  }

  async onConnect(): void {
    this.refs.content.textContent = await this.data;
  }

  private async loadData(): Promise<string> {
    const response = await fetch('/api/data');
    return response.text();
  }
}

DataComponent.register();
```

## Common Extensions

Here are patterns you might want to add to your custom base class:

### Authentication Check

```typescript
protected requireAuth(): void {
  if (!this.isAuthenticated()) {
    this.router?.goto('login');
  }
}
```

### Data Fetching with Caching

```typescript
protected async fetchData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached) as T;

  const data = await fetcher();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}
```

### Form Validation

```typescript
protected validateField(name: string, value: string, rules: Array<(v: string) => boolean>): boolean {
  return rules.every((rule) => rule(value));
}
```

## Best Practices

- Keep your custom base class focused on your project's specific needs.
- Use `protected` methods to expose helpers to subclasses while keeping internals private.
- Leverage `this.onConnectActions` for deferred execution when the component is not yet connected.
- Document your custom helpers so team members understand how to use them.

## See Also

- [Jadis Class](../api/jadis-class.md) — The base class API reference.
- [Lifecycle](./lifecycle.md) — Understanding when `onConnectActions` are executed.
