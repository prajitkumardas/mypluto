import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.setItem("pluto_intro_seen", "true");
  });
});

test("Homepage to Discover and Search to tool detail work by keyboard", async ({ page }) => {
  await page.goto("/");
  const discover = page.getByRole("link", { name: /Discover/i }).first();
  await discover.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/plutos-library/);

  const search = page.getByRole("link", { name: "Search AI tools" }).first();
  await search.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/search/);
  const input = page.getByPlaceholder("Search all AI tools...").first();
  await input.focus();
  await page.keyboard.type("video");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=video/);
  const toolLink = page.locator('a[href^="/tools/"]').first();
  await expect(toolLink).toBeVisible();
  await toolLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tools\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Discover filters and Trending period support keyboard activation", async ({ page }) => {
  await page.goto("/plutos-library");
  const filters = page.getByRole("button", { name: /^Filters/ }).first();
  await filters.focus();
  await page.keyboard.press("Space");
  await expect(filters).toHaveAttribute("aria-expanded", "true");
  const category = page.getByRole("button", { name: "Category" }).first();
  await category.focus();
  await page.keyboard.press("Enter");
  const option = page.getByRole("option").nth(1);
  await option.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/category=/);

  await page.goto("/trending");
  const month = page.getByRole("button", { name: "This month" });
  await month.focus();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/period=month/);
  await expect(month).toHaveAttribute("aria-pressed", "true");
});

test("Compare add and remove controls are named and keyboard operable", async ({ page }) => {
  await page.goto("/compare");
  const add = page.getByRole("button", { name: "Add a tool" }).first();
  await add.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const firstAdd = dialog.getByRole("button", { name: "Add", exact: true }).first();
  await firstAdd.focus();
  await page.keyboard.press("Space");
  const remove = page.getByRole("button", { name: /Remove .* from comparison/ }).first();
  await expect(remove).toBeVisible();
  await remove.focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("0 of 4 selected")).toBeVisible();
});

test("Pluto Guides completes with keyboard controls", async ({ page }) => {
  await page.goto("/pluto-guides");
  const start = page.getByRole("button", { name: "Start guide" });
  await start.focus();
  await page.keyboard.press("Enter");

  for (const step of [1, 2]) {
    const radio = page.getByRole("radio").first();
    await radio.focus();
    await page.keyboard.press("Space");
    const continueButton = page.getByRole("button", { name: "Continue" });
    await continueButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(`Step ${step + 1} of 4`)).toBeVisible();
  }

  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");
  const budget = page.locator('input[name="guide-budget"]').first();
  await budget.focus();
  await page.keyboard.press("Space");
  const submit = page.getByRole("button", { name: "See recommendations" });
  await submit.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Your recommended tools" })).toBeVisible({ timeout: 15_000 });
});

test("Play starts Tic-Tac-Toe with keyboard and exposes cell state", async ({ page }) => {
  await page.goto("/play");
  await page.locator('html[data-hydrated="true"]').waitFor();
  const openPlay = page.getByRole("button", { name: "Play with Pluto" });
  await openPlay.focus();
  await page.keyboard.press("Enter");
  const playNow = page.getByRole("button", { name: "Play now" });
  await expect(playNow).toBeVisible();
  await playNow.focus();
  await page.keyboard.press("Enter");
  const startGame = page.getByRole("button", { name: "Start game" });
  await expect(startGame).toBeVisible();
  await startGame.focus();
  await page.keyboard.press("Enter");
  const board = page.getByRole("grid", { name: "Tic-tac-toe board" });
  await expect(board).toBeVisible();
  const cell = board.getByRole("gridcell").first();
  await cell.focus();
  await page.keyboard.press("Space");
  await expect(cell).toBeDisabled();
});

test("Submit dialog traps focus, validates safely, closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/");
  await page.locator('html[data-hydrated="true"]').waitFor();
  await page.waitForTimeout(1_000);
  const trigger = page.getByRole("button", { name: "Submit a Tool" }).first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const begin = dialog.getByRole("button", { name: "Let's submit" });
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  await begin.focus();
  await page.keyboard.press("Enter");
  await expect(dialog.locator("input").first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Mobile menu, scroll restoration and 404 recovery work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Pluto menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();

  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const home = page.getByRole("link", { name: /home/i }).first();
  await home.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
