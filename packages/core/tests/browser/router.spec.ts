import { expect, test } from '@playwright/test';

const routerModes = ['history', 'hash'] as const;

test.describe('Jadis router', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/browser/router-fixture.html');
    await page.waitForFunction(() => window.__jadisRouterReady === true);
  });

  for (const mode of routerModes) {
    test(`${mode} mode navigates to a route`, async ({ page }) => {
      await page.evaluate((routerMode) => window.startRouter(routerMode), mode);
      await page.evaluate(() => window.__jadisRouter.goto('home'));

      if (mode === 'hash') {
        await expect(page).toHaveURL(/#\/home$/);
      } else {
        await expect(page).toHaveURL(/\/home$/);
      }
      await expect(page.locator('#router-app browser-home')).toBeVisible();
    });

    test(`${mode} mode applies route parameters`, async ({ page }) => {
      await page.evaluate((routerMode) => window.startRouter(routerMode), mode);
      await page.evaluate(() => window.__jadisRouter.goto('details', { id: '123' }));

      if (mode === 'hash') {
        await expect(page).toHaveURL(/#\/details\/123$/);
      } else {
        await expect(page).toHaveURL(/\/details\/123$/);
      }
      await expect(page.locator('#router-app browser-details output')).toHaveText('details:123');
    });
  }

  test('supports grouped routes and root components', async ({ page }) => {
    await page.evaluate(() => window.startRouter('history'));
    await page.evaluate(() => window.__jadisRouter.goto('groupHome'));

    await expect(page).toHaveURL(/\/group\/home$/);
    await expect(page.locator('#router-app browser-root')).toBeVisible();
    await expect(page.locator('#router-app browser-root browser-home')).toBeVisible();
  });

  test('responds to browser history navigation', async ({ page }) => {
    await page.evaluate(() => window.startRouter('history'));
    await page.evaluate(() => window.__jadisRouter.goto('home'));
    await page.evaluate(() => window.__jadisRouter.goto('details', { id: '456' }));

    await page.goBack();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator('#router-app browser-home')).toBeVisible();
  });

  test('rejects unknown routes', async ({ page }) => {
    await page.evaluate(() => window.startRouter('history'));

    await expect(page.evaluate(() => window.__jadisRouter.goto('missing'))).rejects.toThrow(
      'No route found for name: missing'
    );
  });
});

declare global {
  interface Window {
    __jadisRouter?: {
      goto(name: string, params?: Record<string, string>): void;
    };
    __jadisRouterReady?: boolean;
    startRouter(mode: 'hash' | 'history'): void;
  }
}
