# Communication

How components talk: a parent drives its children directly, children report with events, and unrelated parts share a bus.

## Contents

- Choosing
- Parent to child
- Child to parent: `useEvents`
- Across the app: `Bus`
- Services and app state

## Choosing

| Relationship | Use |
|---|---|
| A parent gives a child data | A public `useChange` field (a JSX prop), a public method, or an attribute |
| A parent tells a child to do something | A public method: `dialog.open()` |
| A child tells its parent something happened | `this.events.emit()` on a public `readonly events = this.useEvents<…>()` |
| Unrelated components, or a service and the components | A `Bus` they import, listened to with `this.onBus()` |

Use events for a parent and its child, a bus for messages the whole app hears. Don't route every interaction through a global bus: it hides who depends on whom.

## Parent to child

The parent owns its children and drives them directly.

```tsx
// The child: a public useChange field is its property
export class OrderSummary extends Jadis {
  static readonly selector = 'order-summary';

  readonly total = this.useChange(0, (total) => {
    this._refs.total.textContent = formatPrice(total);
  }, { immediate: true });

  private readonly _refs = this.useRefs((ref) => ({ total: ref('#total') }));

  templateHtml(): Node {
    return <p>Total: <strong id="total" /></p>;
  }

  highlight(): void {
    this._refs.total.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 300 });
  }
}

// The parent
templateHtml(): Node {
  return <OrderSummary total={this.cartTotal()} />;              // set once, at creation
}

private readonly _refs = this.useRefs((ref) => ({ summary: ref(OrderSummary) }));

private drawCart(cart: Cart): void {
  this._refs.summary.total.set(cartTotal(cart));                  // set later
  this._refs.summary.highlight();                                 // a command
}
```

Attributes suit configuration written in HTML (`<order-summary currency="CHF">`). In JSX, set one with `attrs={{ currency: 'CHF' }}` or a hyphenated name; a plain prop sets the property.

## Child to parent: `useEvents`

```tsx
export class OrderRow extends Jadis {
  static readonly selector = 'order-row';

  // Public and named `events`: JSX then accepts onSelect and onRemove, typed.
  readonly events = this.useEvents<{ select: Order; remove: Order; refresh: undefined }>();

  readonly order = this.useChange<Order | undefined>(undefined, (order) => this.draw(order));

  onConnect(): void {
    this.on(this._refs.open, 'click', () => this.report('select'));
    this.on(this._refs.delete, 'click', () => this.report('remove'));
    this.on(this._refs.reload, 'click', () => this.events.emit('refresh'));   // a payload typed undefined is optional
  }

  private report(name: 'select' | 'remove'): void {
    const order = this.order.get();
    if (order) {
      this.events.emit(name, order);
    }
  }
  // …
}
```

The parent listens in one of two ways:

```tsx
// 1. A JSX prop: the listener lasts as long as the element. The way for rows a parent creates.
const row = <OrderRow order={order} onSelect={(selected) => this.open(selected)} onRemove={(removed) => this.removeOrder(removed.id)} />;

// 2. events.register in the parent's onConnect, on a child of its template.
onConnect(): void {
  this._refs.row.events.register('select', (order) => this.open(order));
}
```

- `emit(name, payload)` dispatches a `CustomEvent` on the child itself. It neither bubbles nor crosses shadow roots: only listeners on that element hear it. The listener receives the payload directly, then the event: `(order, event) => …`.
- A listener cancels an event with `event.preventDefault()`, and `emit` then returns `false`. A child that emits before it acts lets its parent refuse: `if (!this.events.emit('close', reason)) return;`.
- `register` and an `on…` prop hear the child's own events only. An event of the same name that bubbles up from an element slotted into the child (the native `change` of a `<select>` in a tab's panel, for a tab bar that emits `change`) does not call back. For those, and for native events with their `button` and `preventDefault()`, write the DOM's handler in lower case (`oncontextmenu={(event) => …}`) or use `this.on(child, 'contextmenu', …)`.
- `register()` binds the listener to the **child's** kill signal: it goes when the child disconnects. A parent that registers in its own `onConnect` registers again each time it connects; a child the parent removes and puts back loses the listener, so a JSX prop suits it better.
- An event emitted before anyone listens is lost. A child that emits from a callback at its connection is heard only through a JSX prop.
- Name events in camel case starting with a lowercase letter: `valueChange` gives `onValueChange`. A name starting with a capital has no JSX prop.
- To let an event cross shadow roots and bubble (an analytics hook, a page-level handler), dispatch your own: `this.dispatchEvent(new CustomEvent('track', { detail, bubbles: true, composed: true }))`.

## Across the app: `Bus`

A bus is a typed event channel that any module can import.

```ts
// src/app-bus.ts
import { Bus } from '@jadis/core';

export const appBus = new Bus<{
  notify: { text: string; tone: 'info' | 'error' };
  cartChange: Cart;
  logout: undefined;
}>();
```

```ts
// In a component: onBus passes the kill signal, so the listener goes at disconnection
onConnect(): void {
  this.onBus(appBus, 'notify', ({ text, tone }) => this.show(text, tone));
}

// Anywhere
appBus.emit('notify', { text: 'Saved', tone: 'info' });
appBus.emit('logout');

// Outside components, the signal is required: it says when the listener ends
const controller = new AbortController();
appBus.register('logout', () => cache.clear(), controller.signal);
```

- Delivery is synchronous, in registration order, to the listeners registered at that moment. A component that connects later does not get earlier messages: for state, also keep the current value somewhere it can read at connection (next section).
- One bus per concern (`appBus`, `cartBus`) keeps the payload types readable.

## Services and app state

Jadis has no store. App state lives in a plain module that owns the value and announces changes on a bus; components read the value at connection and follow the bus.

```ts
// src/services/cart.ts
import { Bus } from '@jadis/core';

export const cartBus = new Bus<{ change: Cart }>();

let cart: Cart = { lines: [] };

export const currentCart = (): Cart => cart;

export function addLine(line: CartLine): void {
  cart = { ...cart, lines: [...cart.lines, line] };
  cartBus.emit('change', cart);
}
```

```ts
// In a component
private readonly _cart = this.useChange<Cart>({ lines: [] }, (cart) => this.drawCart(cart));

onConnect(): void {
  this._cart.set(currentCart());                                   // the value now
  this.onBus(cartBus, 'change', (cart) => this._cart.set(cart));   // and its changes
}
```

The rules (who may add what, totals, limits) stay in the service, free of DOM, so they can be tested without rendering. Components show and report.
