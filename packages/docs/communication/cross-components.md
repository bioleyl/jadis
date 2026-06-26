# Cross-Component Communication

For components that are not directly related (siblings, distant ancestors/descendants), Jadis provides the `Bus` class — a type-safe event bus built on top of the native `EventTarget`.

## The Bus Class

The `Bus` is a generic class that enforces event types at compile time:

```typescript
import { Bus } from '@jadis/core';

// Define your event schema
type AppEvents = {
  userLoggedIn: { id: string; name: string };
  themeChanged: 'light' | 'dark';
  notification: string;
};

const appBus = new Bus<AppEvents>();
```

## Registering Listeners

Inside a Jadis component, use `this.onBus()` to register listeners. It automatically handles registration and cleanup using the component's `killSignal`, so you don't need to pass it manually.

```typescript
this.onBus(appBus, 'userLoggedIn', (detail) => {
  console.log(`User ${detail.name} logged in with ID ${detail.id}`);
});
```

## Emitting Events

```typescript
appBus.emit('userLoggedIn', { id: 'abc123', name: 'Alice' });
appBus.emit('themeChanged', 'dark');
```

## Full Example

### EventBus Setup

```typescript
import { Bus } from '@jadis/core';

export type AppEvents = {
  dataUpdated: string[];
  errorOccurred: Error;
};

export const appBus = new Bus<AppEvents>();
```

### Listener Component

```typescript
class LogPanel extends Jadis {
  static readonly selector = 'log-panel';

  onConnect(): void {
    this.onBus(appBus, 'dataUpdated', (items) => {
      console.log(`Data updated: ${items.length} items`);
    });

    this.onBus(appBus, 'errorOccurred', (err) => {
      console.error('Error:', err.message);
    });
  }
}
```

### Emitter Component

```typescript
class DataFetcher extends Jadis {
  static readonly selector = 'data-fetcher';

  onConnect(): void {
    // Fetch data and emit when done
    fetchData().then((items) => {
      appBus.emit('dataUpdated', items);
    }).catch((err) => {
      appBus.emit('errorOccurred', err);
    });
  }
}
```

## Using the Bus Outside Jadis Components

When using the bus outside of Jadis components, `this.onBus()` is not available. Register listeners directly on the bus and manage cleanup manually:

```typescript
const controller = new AbortController();

appBus.register('dataUpdated', (items) => {
  console.log(items);
}, controller.signal);

// Later, clean up:
controller.abort();
```

## Best Practices

- Define a single event schema per application domain.
- Use `this.onBus()` inside Jadis components for automatic cleanup.
- Keep the bus lightweight — it is not a state management solution.
- For complex state sharing, combine the Bus with direct property access or a dedicated store pattern.

## See Also

- [Bus API Reference](../api/bus-class.md) — Complete method documentation.
- [Child to Parent](./child-to-parent.md) — Simpler event dispatching for parent/child relationships.
