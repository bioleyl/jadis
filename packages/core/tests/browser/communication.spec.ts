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
});

declare global {
  interface Window {
    __busMessages: string[];
    __communicationReady?: boolean;
  }
}
