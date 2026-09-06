import { expect, test } from '@playwright/test';

test.describe('Jadis browser lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/browser/fixture.html');
    await page.waitForFunction(() => window.__jadisReady === true);
  });

  test('processes initial, changed, and removed attributes', async ({ page }) => {
    const component = page.locator('browser-attribute-test');
    const name = component.locator('output').first();

    await expect(name).toHaveText('before');

    await component.evaluate((element) => {
      element.setAttribute('name', 'after');
    });
    await expect(name).toHaveText('after');

    await component.evaluate((element) => {
      element.removeAttribute('name');
    });
    await expect(name).toHaveText('');
  });

  test('processes multiple attribute changes in one task', async ({ page }) => {
    const component = page.locator('browser-attribute-test');
    const outputs = component.locator('output');

    await component.evaluate((element) => {
      element.setAttribute('name', 'updated name');
      element.setAttribute('label', 'updated label');
    });

    await expect(outputs.nth(0)).toHaveText('updated name');
    await expect(outputs.nth(1)).toHaveText('updated label');
  });

  test('recreates attribute observation after reconnecting', async ({ page }) => {
    const component = page.locator('browser-attribute-test');

    await component.evaluate((element) => {
      element.remove();
      document.body.appendChild(element);
      element.setAttribute('name', 'reconnected');
    });

    await expect(component.locator('output').first()).toHaveText('reconnected');
  });
});

declare global {
  interface Window {
    __jadisReady?: boolean;
  }
}
