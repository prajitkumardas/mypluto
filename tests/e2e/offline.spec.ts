import { expect, test } from "@playwright/test";

test("manifest exposes installable, maskable and shortcut metadata", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.orientation).toBe("any");
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBeTruthy();
  expect(manifest.shortcuts).toHaveLength(3);
});

test("service worker caches visited public navigation and falls back offline", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => "serviceWorker" in navigator);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });

  await page.goto("/plutos-library");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/plutos-library/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto(`/verification?offline-uncached=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
  await context.setOffline(false);
});

test("install prompt dismissal timestamp persists locally", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("pluto-pwa-install-dismissed-v1", String(Date.now())));
  await page.goto("/");
  await page.locator('html[data-hydrated="true"]').waitFor();
  await page.reload();
  await expect(page.locator('aside[aria-label="Install Pluto Finds"]')).toHaveCount(0);
  expect(await page.evaluate(() => Number(localStorage.getItem("pluto-pwa-install-dismissed-v1")))).toBeGreaterThan(0);
});
