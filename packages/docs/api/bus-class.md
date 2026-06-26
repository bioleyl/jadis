# Bus Class

A type-safe event bus for cross-component communication. Built on `EventTarget`, it enforces event types at compile time and supports automatic cleanup via `AbortSignal`.

## Import

```typescript
import { Bus } from '@jadis/core';
```

## Creating a Bus

Define your event schema as a generic type parameter:

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

Registers a listener for a specific event. Requires an `AbortSignal` for cleanup.

```typescript
appBus.register('userLoggedIn', (detail) => {
  console.log(`User ${detail.name} logged in`);
}, controller.signal);
```

Inside Jadis components, prefer `this.onBus(bus, event, callback)` instead — it handles registration and cleanup automatically.

| Parameter | Type | Description |
|---|---|---|
| `event` | `keyof AppEvents` | The event name |
| `callback` | `(detail: AppEvents[K]) => void` | Handler function receiving the typed detail |
| `signal` | `AbortSignal` | Signal to abort the listener (use an `AbortController` signal outside Jadis components) |

### `emit(event, detail?)`

Dispatches an event with optional detail.

```typescript
appBus.emit('userLoggedIn', { id: 'abc123', name: 'Alice' });
appBus.emit('themeChanged', 'dark');
appBus.emit('notification', 'New message received');
```

| Parameter | Type | Description |
|---|---|---|
| `event` | `keyof AppEvents` | The event name to emit |
| `detail` | `AppEvents[K]` (optional) | Data passed to listeners |

## Full Example

```typescript
import { Bus, Jadis, html } from '@jadis/core';

// Define events
type AppEvents = {
  dataLoaded: string[];
  error: Error;
};

const bus = new Bus<AppEvents>();

// Listener component
class LogPanel extends Jadis {
  static readonly selector = 'log-panel';

  onConnect(): void {
    this.onBus(bus, 'dataLoaded', (items) => {
      console.log(`Loaded ${items.length} items`);
    });

    this.onBus(bus, 'error', (err) => {
      console.error('Error:', err.message);
    });
  }

  templateHtml(): DocumentFragment {
    return html`<div>Log Panel</div>`;
  }
}

// Emitter component
class DataFetcher extends Jadis {
  static readonly selector = 'data-fetcher';

  onConnect(): void {
    fetchData().then((items) => bus.emit('dataLoaded', items))
      .catch((err) => bus.emit('error', err));
  }

  templateHtml(): DocumentFragment {
    return html`<div>Data Fetcher</div>`;
  }
}

LogPanel.register();
DataFetcher.register();
```

## Outside Jadis Components

When using the bus outside of Jadis components, manage the `AbortController` manually:

```typescript
const controller = new AbortController();

bus.register('dataLoaded', (items) => {
  console.log(items);
}, controller.signal);

// Clean up when done
controller.abort();
```

## See Also

- [Cross-Component Communication](../communication/cross-components.md) — Using the Bus in practice.
