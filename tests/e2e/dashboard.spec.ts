import { expect, test } from '@playwright/test';

test.describe('simulated dashboard periods', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows final KPI values and matching bucket count after period changes', async ({ page }) => {
    await page.goto('/');
    const dashboard = page.locator('#dashboard');
    const equity = dashboard.locator('dl dd').nth(0);
    await expect(equity).not.toHaveText('0.00');

    const count = dashboard.getByTestId('dashboard-bucket-count');
    await expect(count).toHaveText('252');
    await dashboard.getByRole('tab', { name: '1M' }).click();
    await expect(count).toHaveText('21');
    await expect(dashboard.getByText(/Period toggle re-slices the same seeded series/)).toContainText('21 buckets');
  });
});
