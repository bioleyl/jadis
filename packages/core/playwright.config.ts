import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  reporter: 'line',
  testDir: './tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run build && python3 -m http.server 4173 --directory ../..',
    reuseExistingServer: true,
    timeout: 120_000,
    url: 'http://127.0.0.1:4173/packages/core/tests/browser/fixture.html',
  },
});
