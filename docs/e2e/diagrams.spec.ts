import { expect, test } from '@playwright/test';

test('renders a mermaid fence as an SVG diagram', async ({ page }) => {
  await page.goto('/reference/diagrams/');
  await expect(page.locator('.doodle-wrap svg')).toBeVisible();
  await expect(page.locator('.doodle-wrap svg')).toContainText('start');
});

test('redraws the diagram when the theme changes', async ({ page }) => {
  await page.goto('/reference/diagrams/');
  await expect(page.locator('.doodle-wrap svg')).toBeVisible();
  const before = await page.locator('.doodle-wrap svg').innerHTML();
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-theme', 'dark'),
  );
  await expect
    .poll(() => page.locator('.doodle-wrap svg').innerHTML())
    .not.toBe(before);
});

test('maps the diagram accent to the site primary token', async ({ page }) => {
  // Regression guard: the mapping in theme.css must alias --doodle-accent to
  // --nbr-primary, this site's own accent token, not merely to some
  // non-empty value. Reading both through getComputedStyle the same way
  // keeps their formats directly comparable, so this catches a mapping
  // pointed at the wrong token, not only an empty or literal one.
  await page.goto('/reference/diagrams/');
  await expect(page.locator('.doodle-wrap svg')).toBeVisible();
  const [accent, primary] = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return [
      style.getPropertyValue('--doodle-accent').trim(),
      style.getPropertyValue('--nbr-primary').trim(),
    ];
  });
  expect(accent).not.toBe('');
  expect(accent).toBe(primary);
  expect(accent).not.toBe('#5b3cc4');
});
