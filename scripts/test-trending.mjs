import assert from "node:assert/strict";

const baseUrl = process.env.TRENDING_TEST_BASE_URL || "http://127.0.0.1:3000";
const periods = ["today", "week", "month", "new", "updated"];

async function getTrending(params) {
  const url = new URL("/api/trending", baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} should return 200`);
  return response.json();
}

const responses = await Promise.all(periods.map((period) => getTrending({ period, limit: "20" })));

for (const [index, response] of responses.entries()) {
  assert.equal(response.period, periods[index]);
  assert.ok(response.tools.length <= 20, "API must respect the requested limit");
  assert.equal(new Set(response.tools.map((tool) => tool.slug)).size, response.tools.length, "Top tools must be unique");
  assert.ok(Array.isArray(response.categories), "Category choices should be returned");
}

const week = responses[1];
const today = responses[0];
assert.notDeepEqual(
  today.tools.map((tool) => tool.slug),
  week.tools.map((tool) => tool.slug),
  "Today and week rankings should use different windows"
);

const development = await getTrending({ period: "week", category: "development", limit: "20" });
assert.equal(development.category, "development");
assert.ok(
  development.tools.every((tool) => /development|coding|developer|code/i.test(`${tool.category} ${tool.shortDescription} ${tool.bestFor}`)),
  "Development filter should narrow results"
);

const newTools = responses[3];
assert.ok(newTools.tools.every((tool) => tool.releaseDate || tool.scoreConfidence === "low"), "New tools should expose release context or low-confidence fallback");

console.log("Trending API smoke tests passed");