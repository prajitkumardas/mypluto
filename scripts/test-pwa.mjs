import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "src/app/manifest.ts",
  "src/app/offline/page.tsx",
  "src/components/pwa/pwa-shell.tsx",
  "public/sw.js",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/maskable-192.png",
  "public/icons/maskable-512.png",
  "public/icons/apple-touch-icon.png"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const expectedIcons = new Map([
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["public/icons/maskable-192.png", 192],
  ["public/icons/maskable-512.png", 512],
  ["public/icons/apple-touch-icon.png", 180]
]);
for (const [file, size] of expectedIcons) {
  const png = await readFile(file);
  assert.equal(png.subarray(1, 4).toString(), "PNG", `${file} format`);
  assert.equal(png.readUInt32BE(16), size, `${file} width`);
  assert.equal(png.readUInt32BE(20), size, `${file} height`);
}

const manifest = await readFile("src/app/manifest.ts", "utf8");
for (const required of ["standalone", "background_color", "theme_color", "maskable", "start_url"]) {
  assert.ok(manifest.includes(required), `manifest includes ${required}`);
}

const worker = await readFile("public/sw.js", "utf8");
assert.ok(worker.includes('request.method !== "GET"'), "service worker rejects non-GET requests");
assert.ok(worker.includes('url.pathname === "/api/trending"'), "trending API has an explicit strategy");
assert.ok(worker.includes('url.pathname.startsWith("/api/")'), "other APIs bypass caches");
assert.ok(worker.includes('"/admin"') && worker.includes('"/submit-tool"'), "private and submission routes are excluded");
assert.ok(worker.includes("trimCache"), "runtime caches are bounded");
assert.ok(worker.includes("SKIP_WAITING"), "updates are user-activated");

console.log(`PWA checks passed: ${requiredFiles.length} files, ${expectedIcons.size} icons, conservative cache rules.`);
