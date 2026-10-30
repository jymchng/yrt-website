import { expect, test } from '@playwright/test';

/**
 * The contact form is the only place the site can make a claim it cannot
 * verify, so both the client gate and the server's honest answer are covered.
 */

test.describe('contact form', () => {
  test('blocks an empty submit and explains every field', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: 'Send enquiry' }).click();

    const name = page.getByLabel('Name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-describedby', 'name-error');
    await expect(page.locator('#name-error')).toHaveText('Enter at least 2 characters.');
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#message-error')).toBeVisible();

    // Focus moves to the first field that needs attention.
    await expect(name).toBeFocused();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('rejects a malformed email address before anything is sent', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Name').fill('Grace Hopper');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Message').fill('A short but valid message about latency budgets and queue position.');
    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.locator('#email-error')).toContainText('name@example.com');
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('states plainly that nothing was delivered when mail is unconfigured', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel('Name').fill('Grace Hopper');
    await page.getByLabel('Email').fill('grace@example.com');
    await page.getByLabel('Message').fill(
      'We are building a matching-engine simulator and would like to compare latency budgets with your team.',
    );
    // Ensure the chosen default subject is serialized to the server action.
    await expect(page.locator('input[type="hidden"][name="subject"]')).toHaveValue('General enquiry');

    // The form enforces a minimum elapsed time; a real visitor spends at least
    // this long typing, so the test waits like one rather than racing the trap.
    await page.waitForTimeout(3_400);
    await page.getByRole('button', { name: 'Send enquiry' }).click();

    const status = page.getByRole('status');
    await expect(status).toContainText(/Not sent/);
    await expect(status).toContainText(/no mail credentials/i);
    await expect(status).toContainText(/not delivered/i);
    await expect(status).not.toContainText(/Message delivered/i);
  });

  test('keeps the honeypot out of the accessibility tree and the tab order', async ({ page }) => {
    await page.goto('/contact');

    // `sr-only` leaves a 1×1 clipped box, so "not visible" is the wrong probe:
    // what matters is that assistive technology cannot perceive it and the
    // keyboard cannot reach it, while a naive bot still fills and submits it.
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('[aria-hidden="true"] input[name="website"]')).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Website' })).toHaveCount(0);

    await page.getByLabel('Name').focus();
    for (let press = 0; press < 8; press += 1) {
      await page.keyboard.press('Tab');
      const focusedName = await page.evaluate(() => document.activeElement?.getAttribute('name') ?? '');
      expect(focusedName, 'the honeypot must never take focus').not.toBe('website');
    }

    // A visible label for every required control, never a placeholder-only field.
    for (const label of ['Name', 'Email', 'Subject', 'Message']) {
      await expect(page.getByLabel(label, { exact: false }).first()).toBeVisible();
    }
  });

  test('renders direct contact details alongside the form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('link', { name: 'hello@yishunriver.com' }).first()).toBeVisible();
  });
});
