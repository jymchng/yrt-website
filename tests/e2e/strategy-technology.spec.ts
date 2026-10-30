import { expect, test } from '@playwright/test';

test('strategy details are hidden until their accordion is expanded', async ({ page }) => {
  await page.goto('/strategies');

  const trigger = page.getByRole('button', { name: 'Statistical arbitrage details' });
  const details = page.locator('#statistical-arbitrage [data-slot="accordion-content"]');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(details).toBeVisible();
  await expect(details.getByRole('heading', { name: 'Mathematical intuition' })).toBeVisible();
});

test('technology diagram fits a 390px viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/technology');

  await expect(page.getByRole('figure', { name: /Reference architecture/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
