import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end smoke coverage for the real, server-rendered site.
 *
 * `webServer` runs the production server (`next start`), so the suite exercises
 * the same HTML a visitor receives — no dev-only overlays, no client-side
 * patching of missing markup. Build first: `pnpm build && pnpm test:e2e`.
 */
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Optional escape hatch for sandboxes that already ship a Chromium build but
 * cannot run `playwright install`. When unset, Playwright resolves its own
 * managed browser exactly as usual.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const launchOptions = executablePath
  ? { executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
  : {};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // The contact suite asserts the explicit "not configured" branch, so the
      // server must be started *without* mail credentials, whatever the shell
      // happens to export.
      RESEND_API_KEY: '',
      CONTACT_TO_EMAIL: '',
      CONTACT_FROM_EMAIL: '',
    },
  },
});
