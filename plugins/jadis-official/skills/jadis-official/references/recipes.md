# Recipes

Worked examples of what apps need most, written the Jadis way. Types are declared inline to keep each recipe in one place; follow the project's own layout for them.

## Contents

- A list that changes row by row
- A form that sends to a service
- A page that loads its data
- A confirmation dialog
- An app shell: layout, router, language

## A list that changes row by row

A row component that shows one item and reports what the person does, and a list that keeps the rows by id, so a change touches only the rows it concerns.

```tsx
// src/components/todo-row.tsx
import { Jadis } from '@jadis/core';

import styles from './todo-row.css?inline';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export class TodoRow extends Jadis {
  static readonly selector = 'todo-row';

  readonly events = this.useEvents<{ toggle: string; delete: string }>();

  readonly todo = this.useChange<Todo | undefined>(undefined, (todo) => {
    if (todo) {
      this.draw(todo);
    }
  });

  private readonly _refs = this.useRefs((ref) => ({
    done: ref<HTMLInputElement>('#done'),
    text: ref('label'),
    delete: ref<HTMLButtonElement>('#delete'),
  }));

  templateHtml(): Node {
    return (
      <>
        <input id="done" type="checkbox" />
        <label htmlFor="done" />
        <button id="delete" type="button" aria-label="Delete">×</button>
      </>
    );
  }

  templateCss(): string {
    return styles;
  }

  onConnect(): void {
    this.on(this._refs.done, 'change', () => this.report('toggle'));
    this.on(this._refs.delete, 'click', () => this.report('delete'));
  }

  private report(name: 'toggle' | 'delete'): void {
    const todo = this.todo.get();
    if (todo) {
      this.events.emit(name, todo.id);
    }
  }

  private draw(todo: Todo): void {
    this._refs.done.checked = todo.done;
    this._refs.text.textContent = todo.text;
    this.toggleClass('done', todo.done);
  }
}

TodoRow.register();
```

```tsx
// src/components/todo-list.tsx
import { Jadis } from '@jadis/core';

import { type Todo, TodoRow } from './todo-row';

export class TodoList extends Jadis {
  static readonly selector = 'todo-list';

  readonly todos = this.useChange<Todo[]>([], (todos) => this.drawTodos(todos), { immediate: true });

  private readonly _rows = new Map<string, TodoRow>();

  private readonly _refs = this.useRefs((ref) => ({
    form: ref('form'),
    input: ref<HTMLInputElement>('#new'),
    list: ref<HTMLDivElement>('#list'),
    left: ref<HTMLParagraphElement>('#left'),
  }));

  templateHtml(): Node {
    return (
      <>
        <form>
          <input id="new" name="text" required placeholder="What needs doing?" />
          <button type="submit">Add</button>
        </form>
        <div id="list" />
        <p id="left" />
      </>
    );
  }

  onConnect(): void {
    this.on(this._refs.form, 'submit', (event) => {
      event.preventDefault();
      this.add(this._refs.input.value.trim());
    });
  }

  private add(text: string): void {
    if (!text) {
      return;
    }
    this.todos.set((todos) => [...todos, { done: false, id: crypto.randomUUID(), text }]);
    this._refs.form.reset();
  }

  private toggle(id: string): void {
    this.todos.set((todos) => todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  }

  private deleteTodo(id: string): void {
    this.todos.set((todos) => todos.filter((todo) => todo.id !== id));
  }

  private drawTodos(todos: Todo[]): void {
    this.removeGoneRows(todos);
    todos.forEach((todo, index) => {
      const row = this._rows.get(todo.id) ?? this.createRow(todo.id);
      if (row.todo.get() !== todo) {
        row.todo.set(todo); // an item left unchanged is the same object: its row is not drawn again
      }
      this.placeRow(row, index);
    });
    this._refs.left.textContent = `${todos.filter((todo) => !todo.done).length} left`;
  }

  private removeGoneRows(todos: Todo[]): void {
    const ids = new Set(todos.map((todo) => todo.id));
    for (const [id, row] of this._rows) {
      if (!ids.has(id)) {
        row.remove();
        this._rows.delete(id);
      }
    }
  }

  // Inserts a new row, or moves one out of place. A row already in place is left alone: moving it would take its focus.
  private placeRow(row: TodoRow, index: number): void {
    const current = this._refs.list.children.item(index);
    if (current !== row) {
      this._refs.list.insertBefore(row, current);
    }
  }

  private createRow(id: string): TodoRow {
    const row: TodoRow = <TodoRow onToggle={(toggled) => this.toggle(toggled)} onDelete={(deleted) => this.deleteTodo(deleted)} />;
    this._rows.set(id, row);
    return row;
  }
}

TodoList.register();
```

What makes it work:

- The state (`todos`) is replaced on every change, and one callback draws it whole by reconciling the rows. The updates replace only the items they change (`map` keeps the others as they are), so comparing objects finds the rows to draw again.
- A row's `todo.set()` before it is connected is queued and drawn when it connects; afterwards it redraws that row only.
- A row moved with `insertBefore` is not disconnected: it keeps its listeners and state. A row removed from the map and the DOM ends its listeners on its own.
- The JSX listeners (`onToggle`, `onDelete`) last as long as each row.
- `remove` would clash with `HTMLElement.remove`: hence `deleteTodo` and a `delete` event.

## A form that sends to a service

The rule and the server call live in a service, free of DOM; the component shows the states.

```ts
// src/services/newsletter.ts
export type SubscribeResult = { ok: true } | { ok: false; message: string };

export async function subscribe(email: string, signal: AbortSignal): Promise<SubscribeResult> {
  const response = await fetch('/api/subscribe', {
    body: JSON.stringify({ email }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    signal,
  });
  return response.ok ? { ok: true } : { ok: false, message: await response.text() };
}
```

```tsx
// src/components/newsletter-form.tsx
import { Jadis } from '@jadis/core';

import { subscribe } from '../services/newsletter';

type FormState = { status: 'idle' | 'sending' | 'done' } | { status: 'failed'; message: string };

const STATUS_MESSAGE: Record<'idle' | 'sending' | 'done', string> = {
  done: 'Thanks! Check your inbox.',
  idle: '',
  sending: 'Sending…',
};
const NETWORK_FAILURE = 'The network failed. Try again.';

export class NewsletterForm extends Jadis {
  static readonly selector = 'newsletter-form';

  readonly events = this.useEvents<{ subscribe: string }>();

  private readonly _state = this.useChange<FormState>({ status: 'idle' }, (state) => this.drawState(state), {
    immediate: true,
  });

  private readonly _refs = this.useRefs((ref) => ({
    form: ref('form'),
    email: ref<HTMLInputElement>('#email'),
    submit: ref<HTMLButtonElement>('button[type="submit"]'),
    message: ref<HTMLParagraphElement>('#message'),
  }));

  templateHtml(): Node {
    return (
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email" />
        <button type="submit">Subscribe</button>
        <p id="message" role="status" />
      </form>
    );
  }

  onConnect(): void {
    // The browser checks `required` and `type="email"` before it fires submit.
    this.on(this._refs.form, 'submit', (event) => {
      event.preventDefault();
      void this.send(this._refs.email.value);
    });
  }

  private async send(email: string): Promise<void> {
    this._state.set({ status: 'sending' });
    try {
      const result = await subscribe(email, this.killSignal);
      this._state.set(result.ok ? { status: 'done' } : { message: result.message, status: 'failed' });
      if (result.ok) {
        this.events.emit('subscribe', email);
      }
    } catch (error) {
      if (!this.killSignal.aborted) {
        this._state.set({ message: NETWORK_FAILURE, status: 'failed' });
      }
    }
  }

  private drawState(state: FormState): void {
    this._refs.submit.disabled = state.status === 'sending';
    this._refs.message.textContent = 'message' in state ? state.message : STATUS_MESSAGE[state.status];
  }
}

NewsletterForm.register();
```

## A page that loads its data

A routed page with loading, failed, empty and loaded states, kept by the router while its query changes.

```ts
// src/services/orders.ts
export interface Order {
  id: string;
  number: string;
  totalCents: number;
}

export async function fetchOrders(status: string, signal: AbortSignal): Promise<Order[]> {
  const response = await fetch(`/api/orders?status=${encodeURIComponent(status)}`, { signal });
  if (!response.ok) {
    throw new Error(`The orders could not be loaded (${response.status}).`);
  }
  return parseOrders(await response.json()); // validate outside data where it enters
}
```

```tsx
// src/pages/orders/orders-page.tsx
import { Jadis } from '@jadis/core';

import type { ActiveRoute, RoutedPage } from '@jadis/core';

import { fetchOrders, type Order } from '../../services/orders';
import styles from './orders-page.css?inline';

type OrdersState = { status: 'loading' } | { status: 'failed'; message: string } | { status: 'loaded'; orders: Order[] };

const ALL_STATUSES = 'all';
const price = new Intl.NumberFormat('en', { currency: 'CHF', style: 'currency' });

export class OrdersPage extends Jadis implements RoutedPage {
  static readonly selector = 'orders-page';

  private readonly _state = this.useChange<OrdersState>({ status: 'loading' }, (state) => this.drawState(state), {
    immediate: true,
  });

  private _loading?: AbortController;

  private readonly _refs = this.useRefs((ref) => ({
    loading: ref<HTMLParagraphElement>('#loading'),
    error: ref<HTMLParagraphElement>('#error'),
    empty: ref<HTMLParagraphElement>('#empty'),
    orders: ref('ul'),
  }));

  templateHtml(): Node {
    return (
      <>
        <h1>Orders</h1>
        <p id="loading">Loading…</p>
        <p id="error" role="alert" hidden />
        <p id="empty" hidden>No orders.</p>
        <ul />
      </>
    );
  }

  templateCss(): string {
    return styles;
  }

  // Declaring onRoute keeps the page when only the query changes: /orders?status=open → /orders?status=paid.
  onRoute(route: ActiveRoute): void {
    void this.load(route.query.get('status') ?? ALL_STATUSES);
  }

  private async load(status: string): Promise<void> {
    this._loading?.abort(); // the newest query wins
    const loading = new AbortController();
    this._loading = loading;
    const signal = AbortSignal.any([loading.signal, this.killSignal]);
    this._state.set({ status: 'loading' });
    try {
      const orders = await fetchOrders(status, signal);
      if (!signal.aborted) {
        this._state.set({ orders, status: 'loaded' });
      }
    } catch (error) {
      if (!signal.aborted) {
        this._state.set({ message: error instanceof Error ? error.message : String(error), status: 'failed' });
      }
    }
  }

  private drawState(state: OrdersState): void {
    const orders = state.status === 'loaded' ? state.orders : [];
    this._refs.loading.hidden = state.status !== 'loading';
    this._refs.error.hidden = state.status !== 'failed';
    this._refs.error.textContent = state.status === 'failed' ? state.message : '';
    this._refs.empty.hidden = state.status !== 'loaded' || orders.length > 0;
    this._refs.orders.replaceChildren(...orders.map((order) => this.createRow(order)));
  }

  private createRow(order: Order): HTMLLIElement {
    return (
      <li>
        <a href={`/orders/${order.id}`}>{order.number}</a> {price.format(order.totalCents / 100)}
      </li>
    );
  }
}

OrdersPage.register();
```

- The rows are plain elements redrawn together: they hold no state worth keeping. For rows with state, use the keyed list above.
- Text from the server goes in as JSX children: text nodes, never markup.

## A confirmation dialog

The platform's `<dialog>` does the modal work: focus, Escape, the backdrop. The component gives it a promise.

```tsx
// src/components/confirm-dialog.tsx
import { Jadis } from '@jadis/core';

const CONFIRM = 'confirm';

export class ConfirmDialog extends Jadis {
  static readonly selector = 'confirm-dialog';

  private readonly _refs = this.useRefs((ref) => ({
    dialog: ref('dialog'),
    message: ref<HTMLParagraphElement>('#message'),
  }));

  templateHtml(): Node {
    return (
      <dialog>
        <form method="dialog">
          <p id="message" />
          <button value="cancel">Cancel</button>
          <button value={CONFIRM}>Leave</button>
        </form>
      </dialog>
    );
  }

  /** Asks the question; resolves to true when the person confirms, false when they cancel or press Escape. */
  ask(message: string): Promise<boolean> {
    const { dialog } = this._refs;
    this._refs.message.textContent = message;
    dialog.returnValue = '';
    dialog.showModal();
    return new Promise((resolve) => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === CONFIRM), {
        once: true,
        signal: this.killSignal,
      });
    });
  }
}

ConfirmDialog.register();
```

A page that must not lose an edit asks it before it is left:

```tsx
canLeave(): boolean | Promise<boolean> {
  return !this.hasUnsavedChanges() || this._refs.confirm.ask('Leave without saving?');
}
```

A `<form method="dialog">` closes the dialog with the pressed button's `value` as `returnValue`. If the component leaves the page while the dialog is open, the promise never settles: keep the dialog in a frame that stays.

## An app shell: layout, router, language

```ts
// src/layouts/layout.constants.ts: a module without imports, so routes can name the layout without an import cycle
export const APP_LAYOUT = 'app-layout';
```

```ts
// src/routes.ts
import { defineRouteGroup, defineRoutes } from '@jadis/core';

import { APP_LAYOUT } from './layouts/layout.constants';
import { HomePage } from './pages/home/home-page';
import { NotFoundPage } from './pages/not-found/not-found-page';
import { OrdersPage } from './pages/orders/orders-page';

export const routes = defineRoutes({
  ...defineRouteGroup('/', {
    home: { page: HomePage, path: '/' },
    orders: { page: OrdersPage, path: '/orders' },
  }, { rootComponentSelector: APP_LAYOUT }),
  notFound: { page: NotFoundPage, path: '/:rest' },
});
```

```ts
// src/router.ts: the app's one router, imported by whatever navigates
import { Router } from '@jadis/core';

import { routes } from './routes';

export const router = new Router(routes, { links: true });
```

```tsx
// src/layouts/app-layout.tsx: made with each page; marks the current link
import { Jadis } from '@jadis/core';

import { router } from '../router';
import { APP_LAYOUT } from './layout.constants';
import styles from './app-layout.css?inline';

export class AppLayout extends Jadis {
  static readonly selector = APP_LAYOUT;

  private readonly _refs = this.useRefs((ref) => ({ nav: ref('nav') }));

  templateHtml(): Node {
    return (
      <>
        <header>
          <nav>
            <a href="/" data-route="home">Home</a>
            <a href="/orders" data-route="orders">Orders</a>
          </nav>
        </header>
        <main><slot /></main>
      </>
    );
  }

  templateCss(): string {
    return styles;
  }

  onConnect(): void {
    this.markCurrent(router.currentRoute.name);
    this.onBus(router.bus, 'change', (route) => this.markCurrent(route.name)); // pages kept with onRoute
  }

  private markCurrent(routeName: string): void {
    for (const link of this._refs.nav.querySelectorAll('a')) {
      link.dataset.route === routeName ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
    }
  }
}

AppLayout.register();
```

```ts
// src/main.ts
import './layouts/app-layout';

import { i18n } from './i18n/i18n'; // the translator of translations.md
import { router } from './router';

await i18n.setLocale(i18n.match());
router.mountOn(document.getElementById('app') ?? document.body);
```

- Pages import `router` to navigate; `router.ts` imports the routes, which import the pages. That cycle is harmless because nothing uses `router` while the modules load, only later in methods. A class read while modules load (`AppLayout.selector` in the routes, with the layout importing the router) would not be: hence the constant.
- `index.html` holds `<div id="app"></div>` and `<script type="module" src="/src/main.ts"></script>`.
