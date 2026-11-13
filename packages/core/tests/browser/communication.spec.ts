import { expect, test } from '@playwright/test';

test.describe('Jadis communication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/browser/communication-fixture.html');
    await page.waitForFunction(() => window.__communicationReady === true);
  });

  test('sends typed custom messages from a child to its parent', async ({ page }) => {
    await page.locator('browser-parent browser-child #send').click();

    await expect(page.locator('browser-parent #message')).toHaveText('Hello from the child');
  });

  test('sends messages through a shared Bus', async ({ page }) => {
    await page.locator('browser-bus-emitter #send').click();

    await expect(page.locator('browser-bus-receiver #message')).toHaveText('Hello from the bus');
    await expect(page.evaluate(() => window.__busMessages)).resolves.toEqual(['Hello from the bus']);
  });

  test('cleans up Bus listeners when a component disconnects', async ({ page }) => {
    const receiver = page.locator('browser-bus-receiver');
    const emitter = page.locator('browser-bus-emitter #send');

    await receiver.evaluate((element) => element.remove());
    await emitter.click();

    await expect(page.evaluate(() => window.__busMessages)).resolves.toEqual([]);
  });

  test('restores Bus listeners after reconnecting a component', async ({ page }) => {
    const receiver = page.locator('browser-bus-receiver');
    const emitter = page.locator('browser-bus-emitter #send');

    await receiver.evaluate((element) => document.body.appendChild(element));
    await emitter.click();

    await expect(receiver.locator('#message')).toHaveText('Hello from the bus');
  });
  test("gives a component's event prop its own events, not one that bubbles up from a slotted field", async ({
    page,
  }) => {
    await page.locator('browser-tabs #slotted').selectOption('two');
    await expect(page.evaluate(() => window.__tabChanges)).resolves.toEqual([]);

    await page.locator('browser-tabs #second').click();

    await expect(page.evaluate(() => window.__tabChanges)).resolves.toEqual(['second']);
    await expect(page.locator('browser-tabs #current')).toHaveText('second');
  });

  test('lets a listener cancel an event, which the component then leaves out', async ({ page }) => {
    await page.locator('browser-tabs #locked').click();

    await expect(page.evaluate(() => window.__tabChanges)).resolves.toEqual(['locked']);
    await expect(page.locator('browser-tabs #current')).toHaveText('first');
  });

  test("gives a DOM handler written in lower case the event, from the component's own content", async ({
    page,
  }) => {
    await page.locator('browser-tabs #second').click({ button: 'right' });

    await expect(page.evaluate(() => window.__contextButtons)).resolves.toEqual([2]);
  });
});

declare global {
  interface Window {
    __busMessages: string[];
    __communicationReady?: boolean;
    __contextButtons: number[];
    __tabChanges: string[];
  }
}
