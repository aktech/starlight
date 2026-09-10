import { expect, test } from '@playwright/test';

test('renders a mermaid fence as an SVG diagram', async ({ page }) => {
  await page.goto('/reference/diagrams/');
  await expect(page.locator('.doodle-wrap svg')).toBeVisible();
  await expect(page.locator('.doodle-wrap svg')).toContainText('start');
});

test('redraws the diagram in the new theme palette', async ({ page }) => {
  // Mermaid regenerates element ids on every render, so comparing raw SVG
  // markup would pass even if the palette mapping were completely broken:
  // it would only prove a redraw happened, not that it used the right
  // colours. Reading a resolved colour off the edge line (mermaid's
  // lineColor, sourced from --doodle-accent) catches that: it only differs
  // if the diagram actually redrew in the other theme's palette.
  await page.goto('/reference/diagrams/');
  await expect(page.locator('.doodle-wrap svg')).toBeVisible();
  const edgeStroke = () =>
    page
      .locator('.doodle-wrap svg path.flowchart-link')
      .first()
      .evaluate((el) => getComputedStyle(el).stroke);
  const before = await edgeStroke();
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-theme', 'dark'),
  );
  await expect.poll(edgeStroke).not.toBe(before);
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
});
