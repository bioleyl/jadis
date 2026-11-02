import { defineConfig, devices } from '@playwright/test';

/** Not 4173, Vite's preview port, which another project's preview may hold. */
const DEFAULT_PORT = 4391;
const port = Number(process.env.BROWSER_TEST_PORT ?? DEFAULT_PORT);

export default defineConfig({
  fullyParallel: true,
  reporter: 'line',
  testDir: './tests/browser',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `npm run build && npx --yes serve -l ${port} ../..`,
    // Playwright checks the port before it starts the server: one already taken stops the run at once. Waiting for a
    // page instead would wait forever, since serve opens another port when its own is taken.
    port,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
