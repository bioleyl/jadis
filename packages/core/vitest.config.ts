import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/*.test.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/vitest.config.ts',
        '**/package.json',
        '**/docs/**',
      ],
      reporter: ['text', 'html'],
    },
    environment: 'jsdom',
    globals: true,
  },
});
