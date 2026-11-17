import { expect, test, type Page } from "@playwright/test";

async function openChess(page: Page) {
  await page.goto("/play");
  await page.getByRole("button", { name: "Play with Pluto" }).click();
  await page.getByRole("button", { name: "Play Chess" }).click();
  await expect(page.getByRole("heading", { name: "What should Pluto call you?" })).toBeVisible();
  await page.getByLabel("Player name").fill("Alex");
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(page.getByRole("heading", { name: "Chess with Pluto" })).toBeVisible();
  await expect(page.getByText("Alex", { exact: true })).toBeVisible();
}

test("loads the local Stockfish worker", async ({ page }) => {
  await page.goto("/play");
  const messages = await page.evaluate(() => new Promise<string[]>((resolve, reject) => {
    const worker = new Worker("/engines/stockfish-19-asm.js");
    const output: string[] = [];
    const timeout = window.setTimeout(() => {
      worker.terminate();
      resolve(output);
    }, 8_000);
    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(new Error(`Stockfish worker failed to load: ${event.message}`));
    };
    worker.onmessage = (event) => {
      output.push(String(event.data));
      if (event.data === "uciok") {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve(output);
      }
    };
    worker.postMessage("uci");
  }));
  expect(messages).toContain("uciok");
});

test("plays a legal exchange against Pluto", async ({ page }) => {
  await openChess(page);

  await expect(page.locator('[role="gridcell"]')).toHaveCount(64);
  await page.locator('[data-square="e2"]').click();
  await expect(page.locator('[data-square="e4"]')).toHaveAttribute("aria-label", /legal destination/);
  await page.locator('[data-square="e4"]').click();

  await expect(page.getByText("Pluto is thinking", { exact: true })).toBeVisible();
  await expect(page.getByText("Your turn", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel("Move history").locator("strong")).toHaveCount(2);
  await expect(page.getByLabel("Move history")).toContainText("e4");
});

for (const width of [320, 375, 390, 430]) {
  test(`chess fits a ${width}px mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 780 });
    await openChess(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByRole("grid", { name: "Chess board. Alex is White." })).toBeVisible();
  });
}
