import { expect, test } from "@playwright/test";

test("landing footer renders responsive navigation without overflow", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer").filter({ hasText: "Discover the best AI tools" });
  await expect(footer.getByRole("navigation", { name: "Footer navigation" }).locator("section")).toHaveCount(4);

  const viewports = [
    [1920, 1080], [1440, 900], [1366, 768], [1280, 800], [1024, 768], [768, 1024],
    [430, 932], [390, 844], [375, 812], [360, 800], [320, 568]
  ] as const;

  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    const measurements = await footer.evaluate((element) => {
      const stage = element.querySelector('[data-footer-wordmark-stage="true"]');
      const metadata = element.querySelector('[aria-label="Legal links"]')?.parentElement;
      const wordmark = stage?.querySelector('[aria-label="Pluto Finds home"] span');
      if (!wordmark || !stage || !metadata) throw new Error("Footer measurement targets are missing");
      const range = document.createRange();
      range.selectNodeContents(wordmark);
      const text = range.getBoundingClientRect();
      const footerRect = element.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const metadataRect = metadata.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        footerBottom: footerRect.bottom,
        footerTop: footerRect.top,
        metadataTop: metadataRect.top,
        stageBottom: stageRect.bottom,
        stageTop: stageRect.top,
        textBottom: text.bottom,
        textLeft: text.left,
        textRight: text.right,
        textTop: text.top,
        viewportWidth: document.documentElement.clientWidth
      };
    });
    expect(measurements.documentWidth, `${width}px document overflow`).toBeLessThanOrEqual(measurements.viewportWidth + 1);
    expect(measurements.textLeft, `${width}px left crop`).toBeGreaterThanOrEqual(0);
    expect(measurements.textRight, `${width}px right crop`).toBeLessThanOrEqual(width);
    expect(measurements.textTop, `${width}px top crop`).toBeGreaterThanOrEqual(measurements.stageTop);
    expect(measurements.textBottom, `${width}px bottom crop`).toBeLessThanOrEqual(measurements.stageBottom);
    expect(measurements.textBottom, `${width}px metadata overlap`).toBeLessThanOrEqual(measurements.metadataTop);
    expect(measurements.stageTop).toBeGreaterThanOrEqual(measurements.footerTop);
    expect(measurements.stageBottom).toBeLessThanOrEqual(measurements.footerBottom);
  }

  await expect(footer.locator('[data-footer-dust="true"]')).toHaveCSS("display", "none");

  const linkedInIcon = footer.getByRole("img", { name: "LinkedIn" });
  await linkedInIcon.hover();
  await expect(linkedInIcon).toHaveCSS("border-color", "rgba(216, 180, 254, 0.42)");
});

test("large footer wordmark highlights only around the mouse position", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const footer = page.locator("footer").filter({ hasText: "Discover the best AI tools" });
  await footer.scrollIntoViewIfNeeded();
  const wordmark = footer.getByRole("link", { name: "Pluto Finds home" }).last();
  await expect(wordmark.locator("span").first()).toHaveText("PlutoFinds");
  const textBounds = await wordmark.locator("span").first().evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    return { left: rect.left, right: rect.right };
  });
  expect(textBounds.left).toBeGreaterThanOrEqual(0);
  expect(textBounds.right).toBeLessThanOrEqual(1440);
  const layerBounds = await wordmark.locator("span").evaluateAll((elements) => elements.map((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    return { bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top };
  }));
  expect(layerBounds).toHaveLength(2);
  expect(layerBounds[1]).toEqual(layerBounds[0]);
  const dust = footer.locator('[data-footer-dust="true"]');
  await expect(dust.locator("span")).toHaveCount(24);
  await expect(dust).toHaveCSS("pointer-events", "none");
  await expect.poll(() => dust.locator("span").first().evaluate((element) => getComputedStyle(element).animationName)).toContain("footerDustRise");

  await wordmark.locator("span").first().hover({
    position: { x: textBounds.right - textBounds.left > 0 ? (textBounds.right - textBounds.left) * 0.25 : 1, y: 20 }
  });
  await expect(wordmark).toHaveAttribute("data-hovered", "true");
  await expect.poll(() => wordmark.evaluate((element) => element.style.getPropertyValue("--spot-x"))).not.toBe("50%");

  await page.mouse.move(0, 0);
  await expect(wordmark).toHaveAttribute("data-hovered", "false");
});
