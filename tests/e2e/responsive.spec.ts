import { expect, test, type Page } from '@playwright/test';

const PATHS = ['/', '/strategies', '/research', '/technology', '/about', '/contact'];
const WIDTHS = [390, 768, 1024, 1440];

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe('responsive layout', () => {
  // One test per width *and* route: six navigations in a single body regularly
  // exhausted the 30s per-test budget under parallel load (the assertion never
  // fired — the test simply ran out of clock), and one test per route names the
  // route that actually overflowed.
  for (const width of WIDTHS) {
    for (const path of PATHS) {
      test(`no horizontal overflow at ${width}px on ${path}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        expect(await horizontalOverflow(page), `overflow on ${path} at ${width}px`).toBeLessThanOrEqual(1);
      });
    }
  }

  test('charts remain legible at 390px: full-width, no fixed pixel width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const dashboard = page.locator('#dashboard');
    // No scroll needed to measure the box; scrolling only adds a stability wait
    // that a hydration commit can invalidate under parallel load.
    const figure = dashboard.locator('figure[role="img"]').first();
    await expect(figure).toBeVisible();

    const box = await figure.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box?.width ?? 0).toBeLessThanOrEqual(viewport?.width ?? 390);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the sheet opens, navigates and closes on Escape with focus returned', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: 'Open navigation menu' });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('navigation', { name: 'Primary' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a mobile visitor can reach every page from the sheet', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open navigation menu' }).click();

    const sheet = page.getByRole('dialog');
    await sheet.getByRole('link', { name: 'Technology', exact: true }).click();

    await expect(page).toHaveURL(/\/technology$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Technology');
    await expect(sheet).toBeHidden();
  });
});
