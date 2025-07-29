import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'html'], // or 'lcov', 'json' etc.
      exclude: [
        '**/*.test.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/vitest.config.ts',
        '**/package.json',
        '**/docs/**',
      ],
    },
  },
});
