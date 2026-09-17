import { expect, test } from "@playwright/test";

const viewports = [
  [320, 568], [360, 800], [375, 812], [390, 844], [412, 915],
  [768, 1024], [820, 1180], [1024, 768], [1280, 720], [1366, 768],
  [1440, 900], [1920, 1080], [2560, 1440]
] as const;

const routes = ["/", "/plutos-library", "/search?q=video", "/pluto-guides", "/trending", "/compare", "/play", "/tools/10web"];

for (const [width, height] of viewports) {
  test(`${width}x${height} major routes do not overflow horizontally`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.locator("main").first().waitFor();
      const measurements = await page.evaluate(() => ({
        body: document.body.scrollWidth,
        document: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth
      }));
      expect(measurements.body, `${route} body overflowed at ${width}x${height}`).toBeLessThanOrEqual(measurements.viewport + 1);
      expect(measurements.document, `${route} document overflowed at ${width}x${height}`).toBeLessThanOrEqual(measurements.viewport + 1);
    }
  });
}

test("mobile dialogs remain inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await page.locator('html[data-hydrated="true"]').waitFor();
  await page.getByRole("button", { name: "Submit a Tool" }).first().click();
  const box = await page.getByRole("dialog").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeLessThanOrEqual(568);
  expect(box!.width).toBeLessThanOrEqual(320);
});

for (const zoom of [2, 4]) {
  test(`${zoom * 100}% zoom preserves the primary content flow`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/plutos-library");
    await page.evaluate((value) => { document.documentElement.style.zoom = String(value); }, zoom);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Filters/ }).first()).toBeVisible();
  });
}
