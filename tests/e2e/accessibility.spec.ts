import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  ["Homepage", "/"],
  ["Discover", "/plutos-library"],
  ["Search", "/search?q=video"],
  ["Pluto Guides", "/pluto-guides"],
  ["Trending", "/trending"],
  ["Compare", "/compare"],
  ["Play", "/play"],
  ["Tool detail", "/tools/10web"],
  ["Categories", "/categories"],
  ["Verification", "/verification"],
  ["Privacy", "/privacy"],
  ["Submit Tool page", "/submit-tool"],
  ["404", "/this-route-does-not-exist"]
] as const;

function reportAxeResult(name: string, results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
  const impacts = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  for (const violation of results.violations) {
    if (violation.impact && violation.impact in impacts) {
      impacts[violation.impact as keyof typeof impacts] += violation.nodes.length;
    }
  }

  console.log(`AXE ${name}: ${JSON.stringify(impacts)}`);
}

for (const [name, route] of routes) {
  test(`${name} has no serious or critical Axe violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.locator("main").first().waitFor();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    reportAxeResult(name, results);
    const blocking = results.violations.filter((violation) =>
      violation.impact === "critical" || violation.impact === "serious"
    );

    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test("Submit Tool dialog has no serious or critical Axe violations", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator('html[data-hydrated="true"]').waitFor();
  await page.getByRole("button", { name: "Submit a Tool" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const results = await new AxeBuilder({ page }).include("[role=dialog]").analyze();
  reportAxeResult("Submit Tool dialog", results);
  const blocking = results.violations.filter((violation) =>
    violation.impact === "critical" || violation.impact === "serious"
  );
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
