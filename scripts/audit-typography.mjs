import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const allowedFiles = new Set([
  "src/styles/typography.css",
  "src/app/globals.css",
  "src/app/design-system/typography/page.tsx"
]);

const textUtilityPattern = /\b(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|(?:leading|tracking)-\[[^\]]+\]|leading-(?:3|4|5|6|7|8|9|10|none|tight|snug|normal|relaxed|loose)|tracking-(?:tighter|tight|normal|wide|wider|widest)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|heading|body))\b/g;
const cssDeclarationPattern = /\b(?:font-size|line-height|letter-spacing|font-family)\s*:\s*([^;]+);/g;

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (path.includes(`${join("src", "data", "generated")}`)) return [];
      return listFiles(path);
    }
    return /\.(?:tsx?|css)$/.test(entry.name) ? [path] : [];
  });
}

const violations = [];

for (const file of listFiles(sourceRoot)) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const text = readFileSync(file, "utf8");
  if (!allowedFiles.has(rel) && !rel.endsWith(".css")) {
    for (const match of text.matchAll(textUtilityPattern)) {
      violations.push(`${rel}: avoid '${match[0]}'; use a semantic type-* utility or token.`);
    }
  }

  if (rel.endsWith(".css") && !allowedFiles.has(rel)) {
    for (const match of text.matchAll(cssDeclarationPattern)) {
      const value = match[1].trim();
      if (!value.includes("var(--text-") && !value.includes("var(--leading-") && !value.includes("var(--tracking-") && !value.includes("var(--font-")) {
        violations.push(`${rel}: '${match[0]}' should reference typography tokens.`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Typography audit failed:\n" + violations.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Typography audit passed: no hard-coded typography utilities found outside approved token/docs files.");
