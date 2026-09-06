import { expect, test } from '@playwright/test';

test.describe('Jadis component features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/browser/features-fixture.html');
    await page.waitForFunction(() => window.__jadisFeaturesReady === true);
  });

  test('renders JSX fragments and resolves refs', async ({ page }) => {
    const component = page.locator('browser-feature-test');

    await expect(component.locator('output').first()).toHaveText('0');
    await expect(component.locator('#increment')).toHaveText('Increment');
    await expect(component.locator('[slot="footer"]')).toHaveText('Footer content');
  });

  test('updates state and emits events from a DOM event', async ({ page }) => {
    const component = page.locator('browser-feature-test');

    await component.locator('#increment').click();

    await expect(component.locator('output').nth(0)).toHaveText('1');
    await expect(component.locator('output').nth(1)).toHaveText('button clicked');
  });

  test('adds component styles and toggles host classes', async ({ page }) => {
    const component = page.locator('browser-feature-test');

    await expect(
      component.evaluate((element) => element.shadowRoot?.querySelector('style')?.textContent)
    ).resolves.toContain('display: block');

    await component.locator('#toggle').click();
    await expect(component).toHaveClass(/active/);

    await component.locator('#toggle').click();
    await expect(component).not.toHaveClass(/active/);
  });

  test('creates and connects components with toTemplate', async ({ page }) => {
    await page.evaluate(() => window.createFeatureTemplate());

    const component = page.locator('browser-feature-test[data-template="true"]');
    await expect(component.locator('output').first()).toHaveText('0');
  });

  test('mounts component VNodes and projects their children', async ({ page }) => {
    await page.evaluate(() => window.mountVNodeTree());

    const component = page.locator('#vnode-mount browser-vnode-child');
    await expect(component).toHaveCount(1);
    await expect(
      component.evaluate(
        (element) => element.shadowRoot?.querySelector('slot')?.assignedElements()[0]?.textContent
      )
    ).resolves.toBe('Projected child');
  });

  test('reconnects event listeners with a fresh kill signal', async ({ page }) => {
    const component = page.locator('browser-feature-test');

    await component.evaluate((element) => {
      element.remove();
      document.body.appendChild(element);
    });

    await component.locator('#increment').click();
    await expect(component.locator('output').first()).toHaveText('1');
  });
});

declare global {
  interface Window {
    __jadisFeaturesReady?: boolean;
    createFeatureTemplate(): void;
    mountVNodeTree(): void;
  }
}
