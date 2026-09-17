import assert from "node:assert/strict";

const origin = process.argv[2] || "http://127.0.0.1:3013";
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, "sitemap.xml is available");
const sitemap = await sitemapResponse.text();
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.ok(paths.length > 20, "sitemap contains meaningful route coverage");

const failures = [];
let cursor = 0;
await Promise.all(Array.from({ length: 12 }, async () => {
  while (cursor < paths.length) {
    const path = paths[cursor++];
    const response = await fetch(`${origin}${path}`, { redirect: "manual" });
    if (response.status >= 400) failures.push(`${response.status} ${path}`);
  }
}));
assert.deepEqual(failures, [], `sitemap routes failed:\n${failures.join("\n")}`);

const keyRoutes = ["/", "/plutos-library", "/search?q=video", "/trending", "/compare", "/tools/10web", "/play", "/categories/creative", "/collections/ai-starter-kit-for-designers"];
for (const path of keyRoutes) {
  const response = await fetch(`${origin}${path}`);
  assert.equal(response.status, 200, `${path} returns 200`);
  const html = await response.text();
  assert.match(html, /<title>[^<]+<\/title>/, `${path} has a title`);
  assert.match(html, /<meta name="description" content="[^"]+"/, `${path} has a description`);
  assert.match(html, /<link rel="canonical" href="[^"]+"/, `${path} has a canonical URL`);
}

const legacy = await fetch(`${origin}/plutos-library/tool/10web`, { redirect: "manual" });
assert.equal(legacy.status, 308, "legacy tool URL is a permanent redirect");
assert.equal(legacy.headers.get("location"), "/tools/10web", "legacy tool URL targets the canonical route");

console.log(`Production-page checks passed: ${paths.length} sitemap URLs, ${keyRoutes.length} metadata pages, canonical legacy redirect.`);
