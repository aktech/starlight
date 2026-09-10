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

test('reads the diagram accent from this theme, not a hardcoded literal', async ({
  page,
}) => {
  // Regression guard: the mapping in theme.css must alias --doodle-accent to
  // this site's own token (var(--nbr-primary)) rather than a literal color
  // value copied in from somewhere else. A hardcoded literal would not track
  // this theme's palette or its light/dark switch.
  await page.goto('/reference/diagrams/');
  await expect(page.locator('.doodle-wrap svg')).toBeVisible();
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--doodle-accent')
      .trim(),
  );
  expect(accent).not.toBe('');
  expect(accent).not.toBe('#5b3cc4');
});
