import { expect, test, type Page } from '@playwright/test';

const ROUTES = [
  { path: '/', heading: 'Yishun River Trading', nav: 'Home' },
  { path: '/strategies', heading: 'Strategies', nav: 'Strategies' },
  { path: '/research', heading: 'Research', nav: 'Research' },
  { path: '/technology', heading: 'Technology', nav: 'Technology' },
  { path: '/about', heading: 'About', nav: 'About' },
  { path: '/contact', heading: 'Contact', nav: 'Contact' },
] as const;

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;

async function openMobileMenuIfNeeded(page: Page) {
  if (!isMobile(page)) return;
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('every route renders as a real page', () => {
  for (const route of ROUTES) {
    test(`${route.path} has one h1, a main landmark and a title`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(new RegExp(route.heading, 'i'));
      await expect(page).toHaveTitle(/Yishun River Trading/);
    });
  }
});

test.describe('navigation', () => {
  // One test per route rather than a loop: the mobile branch opens the sheet on
  // each route, and six of those in a single test body regularly exceeded the
  // 30s per-test budget under parallel load.
  for (const route of ROUTES) {
    test(`marks ${route.path} as the current route with aria-current`, async ({ page }) => {
      await page.goto(route.path);
      await openMobileMenuIfNeeded(page);

      const nav = page.getByRole('navigation', { name: 'Primary' });
      await expect(nav.getByRole('link', { name: route.nav, exact: true })).toHaveAttribute('aria-current', 'page');
    });
  }

  test('navigates from the header without a full page load', async ({ page }) => {
    await page.goto('/');
    await openMobileMenuIfNeeded(page);

    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Research', exact: true }).click();
    await expect(page).toHaveURL(/\/research$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research');
  });

  test('the footer repeats every destination', async ({ page }) => {
    await page.goto('/about');
    const footer = page.getByRole('contentinfo');
    for (const label of ['Home', 'Strategies', 'Research', 'Technology', 'About', 'Contact']) {
      await expect(footer.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
    }
    await expect(footer).toContainText('simulated data');
  });

  test('the header call to action reaches the contact page', async ({ page }) => {
    await page.goto('/');

    if (isMobile(page)) {
      // Below `md` the header shows the Sheet trigger instead of the CTA, so the
      // sheet's primary action is the reachable equivalent.
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await page.getByRole('dialog').getByRole('link', { name: 'Contact us' }).click();
    } else {
      // The header carries the nav's Contact link *and* the ghost CTA, both
      // pointing at /contact; the CTA is the later of the two in DOM order.
      await page.locator('header').getByRole('link', { name: 'Contact', exact: true }).last().click();
    }

    await expect(page).toHaveURL(/\/contact$/);
  });

  test('the skip link is the first stop and lands on main', async ({ page }) => {
    await page.goto('/research');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/research#main$/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});

test.describe('the home page tells the whole story', () => {
  test('carries the tagline, both hero CTAs and the required headlines', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Yishun River Trading');
    await expect(page.getByText('Yishun Has No River.', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Our Approach/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Discover Our Research/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Markets are complex. Our approach is systematic.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Built on mathematics. Powered by technology.' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'The market never stops moving. Neither does research.' }).first(),
    ).toBeVisible();
  });

  test('labels the dashboard as simulated and makes the period tabs work', async ({ page }) => {
    await page.goto('/');
    const dashboard = page.locator('#dashboard');
    await expect(dashboard.getByText('Simulated data').first()).toBeVisible();

    const figures = dashboard.locator('figure[role="img"]');
    await expect(figures).toHaveCount(4);
    for (const figure of await figures.all()) {
      await expect(figure).toHaveAttribute('aria-label', /.+/);
    }

    await dashboard.getByRole('tab', { name: '1M' }).click();
    // Two elements mention the slice (the caption and the chart's text
    // alternative); the visible caption is the first.
    await expect(dashboard.getByText(/21 buckets/).first()).toBeVisible();
  });
});

test.describe('secondary pages keep their substance', () => {
  test('strategies exposes all seven programmes and keeps detail in the DOM', async ({ page }) => {
    await page.goto('/strategies');

    for (const name of [
      'Statistical Arbitrage',
      'Market Making',
      'Cross-Exchange Arbitrage',
      'Momentum Strategies',
      'Mean Reversion',
      'Liquidity Provision',
      'Portfolio Optimisation',
    ]) {
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
    }

    // The disclosure region is present (forceMount) even while collapsed.
    await expect(page.getByText('Risk considerations').first()).toBeHidden();
    await page.getByRole('button', { name: /Mathematical intuition, market data/ }).first().click();
    await expect(page.getByText('Risk considerations').first()).toBeVisible();
  });

  test('technology shows the seven areas and a described diagram', async ({ page }) => {
    await page.goto('/technology');
    for (const area of [
      'Trading Infrastructure',
      'Market Data Processing',
      'Strategy Backtesting',
      'Execution Systems',
      'Statistical Computing',
      'Distributed Systems',
      'Performance Engineering',
    ]) {
      await expect(page.getByRole('heading', { name: area, exact: true })).toBeVisible();
    }
    // The diagram's text alternative: the figure is named by its caption, and
    // the flow is enumerated in a visually-hidden ordered list inside it.
    await expect(page.getByRole('figure', { name: /architecture/i })).toBeVisible();
  });

  test('about carries the name story without inventing history', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'Our Philosophy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our Name' })).toBeVisible();
    await expect(page.getByText('Yishun has no river. But every market has a current.').first()).toBeVisible();
  });
});

test.describe('system surfaces', () => {
  test('an unknown URL renders the styled 404 with a way back', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /home|back/i }).first()).toBeVisible();
  });

  test('robots.txt and sitemap.xml are served', async ({ page }) => {
    const robots = await page.request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap');

    const sitemap = await page.request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    for (const path of ['/strategies', '/research', '/technology', '/about', '/contact']) {
      expect(xml).toContain(path);
    }
  });

  test('the Open Graph image is generated', async ({ page }) => {
    const response = await page.request.get('/opengraph-image');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  });
});
