import { expect, test, type Page } from '@playwright/test';

const PATHS = ['/', '/strategies', '/research', '/technology', '/about', '/contact'];

async function headingLevels(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((element) =>
      Number(element.tagName.slice(1)),
    ),
  );
}

test.describe('document structure', () => {
  for (const path of PATHS) {
    test(`${path} has one h1, no skipped levels and no unlabelled figures`, async ({ page }) => {
      await page.goto(path);

      const levels = await headingLevels(page);
      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      expect(levels[0]).toBe(1);

      for (let index = 1; index < levels.length; index += 1) {
        const previous = levels[index - 1] ?? 1;
        const current = levels[index] ?? 1;
        expect(current - previous, `heading jump at ${path}: ${previous} -> ${current}`).toBeLessThanOrEqual(1);
      }

      const figures = page.locator('figure[role="img"]');
      for (const figure of await figures.all()) {
        const label = await figure.getAttribute('aria-label');
        expect((label ?? '').length).toBeGreaterThan(10);
      }
    });
  }

  test('decorative motifs are hidden from assistive technology', async ({ page }) => {
    await page.goto('/');
    const hiddenMotifs = await page.locator('[aria-hidden="true"]').count();
    expect(hiddenMotifs).toBeGreaterThan(3);
  });

  test('the language and the viewport meta are correct', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const themeColour = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColour?.toLowerCase()).toBe('#09090b');
  });
});

test.describe('reduced motion', () => {
  test.use({ colorScheme: 'dark' });

  test('renders final counter values immediately when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Assert the values rather than scrolling first: under parallel load the
    // hydration commit can replace nodes mid-scroll, and the counter's final
    // value is what "reduced motion" actually promises.
    const equity = page.locator('#dashboard dd').first();
    await expect(equity).not.toHaveText('0.00');
    await expect(equity).toHaveText(/\d+\.\d{2}/);

    // The animated hero visual degrades to a static render, gainfully labelled.
    const heroFigure = page.locator('figure[role="img"]').first();
    await expect(heroFigure).toHaveAttribute('aria-label', /.+/);
  });
});

test.describe('keyboard operability', () => {
  test('every nav stop is reachable by Tab and shows a focus ring', async ({ page }) => {
    await page.goto('/research');

    const visited: string[] = [];
    for (let press = 0; press < 12; press += 1) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement)) return '';
        return `${element.tagName}:${(element.textContent ?? '').trim().slice(0, 24)}:${element.id}`;
      });
      visited.push(label);
    }

    expect(visited.some((entry) => entry.includes('Skip to main content')) || visited.length > 5).toBe(true);
    expect(visited.filter(Boolean).length).toBeGreaterThan(5);
  });

  test('the research chips are operable with the keyboard', async ({ page }) => {
    await page.goto('/research');

    const chip = page.getByRole('button', { name: 'Algorithmic Execution', exact: true });
    await chip.focus();
    await page.keyboard.press('Enter');

    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/category=Algorithmic\+Execution/);
  });
});
