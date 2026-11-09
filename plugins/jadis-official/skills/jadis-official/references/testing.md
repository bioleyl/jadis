# Testing

Unit tests in Vitest with jsdom for components and services; Playwright in a real browser for what jsdom does not reproduce.

## Contents

- Vitest and jsdom
- The timing to wait for
- A component test
- Services without a DOM
- The router in tests
- Playwright

## Vitest and jsdom

```bash
npm install -D vitest jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // css: true,   // only if a test reads styles: CSS imports, ?inline included, are empty by default
  },
});
```

jsdom has custom elements, open shadow roots, slots, `MutationObserver` and `CustomEvent`. It has no layout (sizes are zero), and no `adoptedStyleSheets`: components get a `<style>` there instead.

## The timing to wait for

| After | Already done | Wait for the rest |
|---|---|---|
| `document.body.append(element)` | Template, attribute callbacks, queued `useChange` changes, `immediate` callbacks, translations | `onConnect()` and its listeners: `await nextTask()` |
| `element.setAttribute(…)` on a connected component | Nothing | The attribute callback: `await Promise.resolve()` (a `MutationObserver` delivers it) |
| `field.set(value)` on a connected component | The callback | Nothing |
| `element.remove()` | Nothing | `onDisconnect()` and the end of listeners: `await Promise.resolve()` |

```ts
const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));
```

Never sleep for a fixed time: wait for the step that does the work.

## A component test

```ts
// src/components/quantity-stepper.test.ts
import { createElement } from '@jadis/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { QuantityStepper } from './quantity-stepper';   // importing it registers it

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));
const output = (stepper: QuantityStepper) => stepper.shadowRoot?.querySelector('output')?.textContent;
const button = (stepper: QuantityStepper, id: string) => stepper.shadowRoot?.querySelector<HTMLButtonElement>(`#${id}`);

afterEach(() => document.body.replaceChildren());

describe('quantity-stepper', () => {
  it('shows the value of its attribute as soon as it is connected', () => {
    const stepper = createElement(QuantityStepper, { attrs: { value: '3' } }, document.body);

    expect(output(stepper)).toBe('3');
  });

  it('steps up and reports the new value', async () => {
    const stepper = createElement(QuantityStepper, {}, document.body);
    const onValueChange = vi.fn();
    stepper.events.register('valueChange', onValueChange);
    await nextTask();                                   // onConnect wires the buttons

    button(stepper, 'increase')?.click();

    expect(stepper.value.get()).toBe(2);
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it('stays at the minimum, its decrease button disabled', async () => {
    const stepper = createElement(QuantityStepper, {}, document.body);
    await nextTask();

    button(stepper, 'decrease')?.click();

    expect(stepper.value.get()).toBe(1);
    expect(button(stepper, 'decrease')?.disabled).toBe(true);
  });

  it('follows a change of its attribute', async () => {
    const stepper = createElement(QuantityStepper, {}, document.body);

    stepper.setAttribute('value', '5');
    await Promise.resolve();

    expect(output(stepper)).toBe('5');
  });

  it('keeps working after it is removed and put back', async () => {
    const stepper = createElement(QuantityStepper, {}, document.body);
    await nextTask();                                   // the first onConnect
    stepper.remove();
    await Promise.resolve();                            // the disconnection
    document.body.append(stepper);
    await nextTask();                                   // onConnect again

    button(stepper, 'increase')?.click();

    expect(stepper.value.get()).toBe(2);
  });
});
```

- `createElement(Class, { props, attrs }, parent)` creates, configures and appends in one call, typed as the class.
- Query inside with `element.shadowRoot?.querySelector(…)`; slotted children with `element.querySelector(…)`.
- `button.click()` fires `click`; `checkbox.click()` toggles it and fires `click`, `input` and `change`, as in a browser. For a text field, set `value`, then `field.dispatchEvent(new Event('input'))`; for a form, `form.requestSubmit()`.
- Test what the person sees and what the component reports (text, disabled state, events), and the edges: empty, one, many, at a limit, after a reconnection.
- Empty the document between tests.

## Services without a DOM

Rules and app state in `services/` take plain values and return plain values: test them directly, with the server call replaced by a fake passed in or a module mock. They need no component and no waiting.

## The router in tests

`new Router(routes, { signal })` listens on `window` for the life of the test file: pass a signal and abort it after each test. Set the URL with `history.replaceState({}, '', '/orders/42')` before `mountOn(container)`, then wait a task for the page's `onConnect` and `onRoute`.

## Playwright

A real browser for what jsdom cannot show faithfully: connection timing, shadow DOM and slots, styles and layout, history and links, keyboard and focus.

```ts
import { expect, test } from '@playwright/test';

test('the stepper counts', async ({ page }) => {
  await page.goto('/');
  const stepper = page.locator('quantity-stepper');

  await stepper.getByRole('button', { name: 'Increase' }).click();

  await expect(stepper.locator('output')).toHaveText('2');
});
```

- Playwright's locators pierce open shadow roots.
- `expect(locator).toHaveText()` and the other web-first assertions wait on their own: they cover the task before `onConnect`. Never `waitForTimeout`.
