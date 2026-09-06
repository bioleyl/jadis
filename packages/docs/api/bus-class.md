# Bus Class

A type-safe event bus for cross-component communication. Built on `EventTarget`, it enforces event types at compile time and supports automatic cleanup via `AbortSignal`.

## Import

```typescript
import { Bus } from '@jadis/core';
```

## Creating a Bus

```typescript
type AppEvents = {
  userLoggedIn: { id: string; name: string };
  themeChanged: 'light' | 'dark';
  notification: string;
};

const appBus = new Bus<AppEvents>();
```

## Methods

### `register(event, callback, signal)`

Registers a listener for a specific event. Outside a Jadis component, provide an `AbortSignal` for cleanup.

```typescript
const controller = new AbortController();
appBus.register('userLoggedIn', (detail) => {
  console.log(`User ${detail.name} logged in`);
}, controller.signal);
```

Inside Jadis components, prefer `this.onBus(bus, event, callback)` instead.

### `emit(event, detail?)`

Dispatches an event with optional detail:

```typescript
appBus.emit('userLoggedIn', { id: 'abc123', name: 'Alice' });
appBus.emit('themeChanged', 'dark');
appBus.emit('notification', 'New message received');
```

## Full example

```tsx
import { Bus, Jadis } from '@jadis/core';

type AppEvents = {
  dataLoaded: string[];
  error: Error;
};

const bus = new Bus<AppEvents>();

const fetchData = async (): Promise<string[]> => ['ready'];

class LogPanel extends Jadis {
  static readonly selector = 'log-panel';

  onConnect(): void {
    this.onBus(bus, 'dataLoaded', (items) => {
      console.log(`Loaded ${items.length} items`);
    });

    this.onBus(bus, 'error', (error) => {
      console.error('Error:', error.message);
    });
  }

  templateHtml(): Node {
    return <div>Log Panel</div>;
  }
}

class DataFetcher extends Jadis {
  static readonly selector = 'data-fetcher';

  onConnect(): void {
    fetchData()
      .then((items) => bus.emit('dataLoaded', items))
      .catch((error) => bus.emit('error', error));
  }

  templateHtml(): Node {
    return <div>Data Fetcher</div>;
  }
}

LogPanel.register();
DataFetcher.register();
```

## Outside Jadis components

Manage the `AbortController` manually:

```typescript
const controller = new AbortController();
bus.register('dataLoaded', (items) => console.log(items), controller.signal);
controller.abort();
```

## See also

- [Cross-Component Communication](../communication/cross-components.md)
