import { expect, test } from '@playwright/test';

test.describe('research index filtering', () => {
  test('filters by category and reflects it in the URL', async ({ page }) => {
    await page.goto('/research');

    // Results are the labelled list of entries, not the last list with links
    // (the footer repeats every destination in its own list).
    const results = page.getByRole('list', { name: 'Research entries' });
    await expect(page.getByRole('button', { name: 'Market Microstructure', exact: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await page.getByRole('button', { name: 'Market Microstructure', exact: true }).click();
    await expect(page).toHaveURL(/category=Market\+Microstructure/);
    await expect(page.getByText(/2 entries in Market Microstructure/)).toBeVisible();

    const links = results.getByRole('link');
    await expect(links).toHaveCount(2);
  });

  test('restores a filtered view from a shared link', async ({ page }) => {
    await page.goto('/research?category=Financial+Machine+Learning');

    await expect(page.getByRole('button', { name: 'Financial Machine Learning' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByText(/2 entries in Financial Machine Learning/)).toBeVisible();
  });

  test('searches as you type and shows a real empty state', async ({ page }) => {
    await page.goto('/research');
    const search = page.getByLabel('Search research');

    await search.fill('latency');
    await expect(page).toHaveURL(/q=latency/);
    await expect(page.getByText(/matching \u201clatency\u201d/)).toBeVisible();

    await search.fill('zzzz-no-such-term');
    await expect(page.getByText('No matching entries')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clear filters' })).toBeVisible();
  });

  test('clears the filters back to the full index', async ({ page }) => {
    await page.goto('/research?category=Market+Microstructure&q=queue');

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page).toHaveURL(/\/research$/);
    await expect(page.getByText(/12 entries/)).toBeVisible();
  });

  test('an unknown category degrades instead of emptying the page', async ({ page }) => {
    await page.goto('/research?category=Astrology');
    await expect(page.getByText(/Unknown category/)).toBeVisible();
    await expect(page.getByText(/12 entries/)).toBeVisible();
  });
});

test.describe('research articles', () => {
  test('opens an article with metadata, body and a labelled illustrative badge', async ({ page }) => {
    await page.goto('/research');
    await page.getByRole('link', { name: 'A latency budget you can actually defend' }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('A latency budget you can actually defend');
    await expect(page).toHaveURL(/\/research\/latency-budget-arithmetic$/);
    await expect(page.getByText('Illustrative entry — method, not results').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();

    await expect(page).toHaveTitle(/A latency budget you can actually defend/);
  });

  test('offers breadcrumb navigation back to the index', async ({ page }) => {
    await page.goto('/research/backtest-fill-assumptions');

    const crumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(crumbs).toBeVisible();
    await crumbs.getByRole('link', { name: 'Research' }).click();
    await expect(page).toHaveURL(/\/research$/);
  });
});
