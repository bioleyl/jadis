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

  test.describe('a page that refuses to be left', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => window.startRouter('history'));
      await page.evaluate(() => window.__jadisRouter?.goto('home'));
      await page.evaluate(() => window.__jadisRouter?.goto('editor'));
      await expect(page.locator('#router-app browser-editor')).toBeVisible();
    });

    test('keeps the earlier entry when it refuses the back button', async ({ page }) => {
      await page.evaluate(() => {
        window.__leaveAnswer = false;
      });

      await page.goBack();
      await expect(page).toHaveURL(/\/editor$/);
      await expect(page.locator('#router-app browser-editor')).toBeVisible();

      await page.evaluate(() => {
        window.__leaveAnswer = true;
      });
      await page.goBack();
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.locator('#router-app browser-home')).toBeVisible();
    });

    test('leaves no entry behind when it refuses a link', async ({ page }) => {
      await page.evaluate(() => {
        window.__leaveAnswer = false;
        window.history.pushState({}, '', '/details/9');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(/\/editor$/);

      await page.evaluate(() => {
        window.__leaveAnswer = true;
      });
      await page.goBack();
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.locator('#router-app browser-home')).toBeVisible();
    });

    test('waits for an answer that comes later, then stays or goes back', async ({ page }) => {
      await page.evaluate(() => {
        window.__leaveAnswer = 'later';
      });

      await page.goBack();
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.locator('#router-app browser-editor')).toBeVisible();
      await page.evaluate(() => window.__answerLeave?.(false));
      await expect(page).toHaveURL(/\/editor$/);
      await expect(page.locator('#router-app browser-editor')).toBeVisible();

      await page.goBack();
      await expect(page).toHaveURL(/\/home$/);
      await page.evaluate(() => window.__answerLeave?.(true));
      await expect(page.locator('#router-app browser-home')).toBeVisible();
      await expect(page).toHaveURL(/\/home$/);
    });
  });

  test('goes back to a refusing page past an entry the app pushed on its own, asking once', async ({ page }) => {
    await page.evaluate(() => {
      window.startRouter('history');
      window.__jadisRouter?.goto('home');
      // The page keeps its tab in the query, without a popstate: the router does not see that entry.
      window.history.pushState({}, '', '/home?tab=2');
      window.__jadisRouter?.goto('editor');
      window.__leaveAnswer = false;
      window.__leaveAsked = 0;
    });

    await page.goBack();
    await expect(page).toHaveURL(/\/editor$/);
    await page.waitForTimeout(200);

    await expect(page).toHaveURL(/\/editor$/);
    expect(await page.evaluate(() => window.__leaveAsked)).toBe(1);
    await page.evaluate(() => {
      window.__leaveAnswer = true;
    });
    await page.goBack();
    await expect(page).toHaveURL(/\/home\?tab=2$/);
    await expect(page.locator('#router-app browser-home')).toBeVisible();
  });

  test('follows a link inside a shadow root, without loading the page again', async ({ page }) => {
    await page.evaluate(() => {
      window.startRouter('history', { links: true });
      window.__notReloaded = true;
      const host = document.body.appendChild(document.createElement('div'));
      const link = document.createElement('a');
      link.href = '/details/5';
      link.textContent = 'Order 5';
      host.attachShadow({ mode: 'open' }).append(link);
    });

    await page.getByRole('link', { name: 'Order 5' }).click();

    await expect(page).toHaveURL(/\/details\/5$/);
    await expect(page.locator('#router-app browser-details output')).toHaveText('details:5');
    expect(await page.evaluate(() => window.__notReloaded)).toBe(true);
  });

  test('replaces the history entry, so back skips the page left', async ({ page }) => {
    await page.evaluate(() => window.startRouter('history'));
    await page.evaluate(() => window.__jadisRouter.goto('home'));
    await expect(page).toHaveURL(/\/home$/);

    await page.evaluate(() => window.__jadisRouter.replace('details', { id: '2' }));
    await expect(page.locator('#router-app browser-details output')).toHaveText('details:2');
    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#router-app browser-base')).toBeVisible();
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
      replace(name: string, params?: Record<string, string>): void;
    };
    __notReloaded?: boolean;
    __leaveAnswer?: boolean | 'later';
    __leaveAsked?: number;
    __answerLeave?: (leave: boolean) => void;
    __jadisRouterReady?: boolean;
    startRouter(mode: 'hash' | 'history', options?: { links?: boolean }): void;
  }
}
