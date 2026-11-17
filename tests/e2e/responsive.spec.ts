import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("pluto_intro_seen", "true"));
});

const viewports = [
  [320, 568], [340, 760], [360, 800], [375, 812], [390, 844], [412, 915],
  [430, 932], [454, 900], [545, 900],
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

test("mobile comparison keeps its wide table inside a labelled scroll region", async ({ page }) => {
  await page.setViewportSize({ width: 340, height: 760 });
  await page.goto("/compare?tools=10web,chatgpt");
  await page.getByRole("button", { name: "Compare tools" }).click();

  const region = page.getByRole("region", { name: "Tool comparison table" });
  await expect(region).toBeVisible();
  const measurements = await region.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth
  }));
  expect(measurements.scrollWidth).toBeGreaterThan(measurements.clientWidth);
  await expect(page.getByText("Scroll horizontally to compare every tool.")).toBeVisible();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(341);
});

for (const [width, height] of [[320, 568], [390, 844]] as const) {
  test(`Play landing fits the ${width}x${height} mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/play");

    const copy = page.getByText("He's been sitting here all alone.", { exact: false });
    const playButton = page.getByRole("button", { name: "Play with Pluto" });
    await expect(copy).toBeVisible();
    await expect(playButton).toBeVisible();

    const [copyBox, buttonBox] = await Promise.all([copy.boundingBox(), playButton.boundingBox()]);
    expect(copyBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.y).toBeGreaterThanOrEqual(copyBox!.y + copyBox!.height);

    const viewport = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
      scrollY: window.scrollY
    }));
    expect(viewport.scrollHeight).toBeLessThanOrEqual(viewport.clientHeight + 1);
    expect(viewport.scrollY).toBe(0);
  });
}

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
