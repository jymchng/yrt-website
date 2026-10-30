import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** `@/*` mirrors the `paths` entry in tsconfig.json, so tests import exactly
 * what the application imports. */
const rootDir = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': rootDir },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    // Playwright specs live in tests/e2e and must never run under Vitest.
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**', 'tests/e2e/**'],
    restoreMocks: true,
    css: false,
    reporters: ['default'],
  },
});
