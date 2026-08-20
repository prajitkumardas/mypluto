import ExcelJS from "exceljs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const workbookPath =
  process.argv[2] || "C:/Users/ASUS/Downloads/AI_Tools_Directory (6).xlsx";
const outputDir = path.resolve("src/data/generated");
const outputPath = path.join(outputDir, "plutos-library.json");
const summaryPath = path.join(outputDir, "plutos-library-summary.json");

const supportingSheets = new Set([
  "README",
  "Master Directory",
  "Categories",
  "Subcategories",
  "Pricing Overview",
  "Sources",
  "AI Models",
  "Open Source",
  "API & Developer Tools",
  "Recently Added",
  "Needs Verification"
]);

const categoryHeaders = [
  "Tool Name",
  "Subcategory",
  "Official Website",
  "Short Description",
  "Pricing Model",
  "Free Plan",
  "Starting Price",
  "Key Features",
  "Platform",
  "API",
  "Best Use Cases",
  "Target Audience",
  "Limitations",
  "Last Verified",
  "Source",
  "Status"
];

const placeholderPrefixes = [
  "not yet populated",
  "scope this as a follow-up",
  "placeholder",
  "todo",
  "tbd"
];

const value = (cell) => {
  if (!cell) return "";
  if (typeof cell === "string") return cell.trim();
  if (typeof cell === "number") return String(cell);
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  if (cell.text) return String(cell.text).trim();
  if (cell.hyperlink) return String(cell.hyperlink).trim();
  if (cell.richText) return cell.richText.map((part) => part.text).join("").trim();
  return String(cell).trim();
};

const slugify = (input) =>
  input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

const splitList = (input) =>
  value(input)
    .split(/;|,(?=\s[A-Z0-9])/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeUrl = (input) => {
  const raw = value(input);
  if (!raw) return { raw, normalized: "", domain: "" };

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    url.protocol = "https:";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^gclid$|^mc_cid$|^mc_eid$/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    const normalized = url.toString().replace(/\/$/, "");
    return { raw, normalized, domain: url.hostname };
  } catch {
    return { raw, normalized: raw.trim(), domain: "" };
  }
};

const normalizeVerification = (lastVerified, source, status) => {
  const verified = value(lastVerified);
  const sourceText = value(source);
  const statusText = value(status);
  const combined = `${verified} ${sourceText} ${statusText}`.toLowerCase();

  if (combined.includes("sunsetting")) return "Sunsetting";
  if (combined.includes("uncertain")) return "Uncertain status";
  if (combined.includes("website unavailable")) return "Website unavailable";
  if (combined.includes("not fully verified")) return "Partially verified";
  if (combined.includes("not verified this session")) return "Needs verification";
  if (!verified) return "Not verified";
  if (/^\d{4}-\d{2}-\d{2}$/.test(verified) && sourceText) return "Verified";
  return "Partially verified";
};

const normalizeFreePlan = (input) => {
  const raw = value(input);
  const lower = raw.toLowerCase();
  if (!raw) return { raw, normalized: "Unknown" };
  if (lower.startsWith("yes") || lower.includes("free")) return { raw, normalized: "Yes" };
  if (lower.startsWith("no")) return { raw, normalized: "No" };
  return { raw, normalized: "Unclear" };
};

const normalizeApi = (input) => {
  const raw = value(input);
  const lower = raw.toLowerCase();
  if (!raw) return { raw, normalized: "Unknown", notes: "" };
  if (lower.includes("enterprise")) return { raw, normalized: "Enterprise only", notes: raw };
  if (lower.includes("limited")) return { raw, normalized: "Limited", notes: raw };
  if (lower === "yes" || lower.startsWith("yes")) return { raw, normalized: "Yes", notes: raw };
  if (lower === "no" || lower.startsWith("no")) return { raw, normalized: "No", notes: raw };
  return { raw, normalized: "Unclear", notes: raw };
};

const isPlaceholder = (name) =>
  placeholderPrefixes.some((prefix) => name.toLowerCase().startsWith(prefix));

const rowToObject = (row, headers) => {
  const record = {};
  headers.forEach((header, index) => {
    record[header] = value(row.getCell(index + 1).value);
  });
  return record;
};

const addUnique = (target, values) => {
  for (const item of values) {
    if (!target.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      target.push(item);
    }
  }
};

const similarityScore = (a, b) => {
  const overlap = (left, right, weight) => {
    const leftSet = new Set(left.map((item) => item.toLowerCase()));
    return right.some((item) => leftSet.has(item.toLowerCase())) ? weight : 0;
  };

  let score = 0;
  score += overlap(a.subcategories, b.subcategories, 30);
  score += overlap(a.useCases, b.useCases, 20);
  score += overlap(a.features, b.features, 15);
  score += overlap(a.categories, b.categories, 10);
  score += overlap(a.targetAudiences, b.targetAudiences, 10);
  score += a.pricing.model === b.pricing.model ? 5 : 0;
  score += overlap(a.platforms, b.platforms, 5);
  score += a.api.normalized === b.api.normalized ? 3 : 0;
  score += a.verification.status === b.verification.status ? 2 : 0;
  return score;
};

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);

const importErrors = [];
const categories = [];
const subcategories = [];
const toolMap = new Map();
const recentlyAdded = [];
const needsVerification = [];

const categoriesSheet = workbook.getWorksheet("Categories");
const subcategoriesSheet = workbook.getWorksheet("Subcategories");
const masterSheet = workbook.getWorksheet("Master Directory");

if (!categoriesSheet) importErrors.push({ sheet: "Categories", reason: "Missing worksheet" });
if (!subcategoriesSheet) importErrors.push({ sheet: "Subcategories", reason: "Missing worksheet" });
if (!masterSheet) importErrors.push({ sheet: "Master Directory", reason: "Missing worksheet" });

if (categoriesSheet) {
  categoriesSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = value(row.getCell(1).value);
    if (!name) return;
    categories.push({
      id: slugify(name),
      name,
      slug: slugify(name),
      workbookToolCount: Number(value(row.getCell(3).value)) || 0,
      workbookSubcategoryCount: Number(value(row.getCell(2).value)) || 0,
      status: value(row.getCell(4).value),
      notes: value(row.getCell(5).value),
      description: value(row.getCell(5).value) || `${name} tools and workflows.`
    });
  });
}

if (subcategoriesSheet) {
  subcategoriesSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const categoryName = value(row.getCell(1).value);
    const name = value(row.getCell(2).value);
    if (!categoryName || !name) return;
    subcategories.push({
      id: `${slugify(categoryName)}__${slugify(name)}`,
      name,
      slug: slugify(name),
      categoryId: slugify(categoryName),
      categoryName
    });
  });
}

const categoryWorksheets = workbook.worksheets.filter((worksheet) => {
  if (supportingSheets.has(worksheet.name)) return false;
  const headers = worksheet.getRow(4).values.slice(1).map(value);
  return categoryHeaders.every((header) => headers.includes(header));
});

for (const worksheet of categoryWorksheets) {
  const categoryName = value(worksheet.getRow(1).getCell(1).value) || worksheet.name;
  const headers = worksheet.getRow(4).values.slice(1).map(value);

  for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const record = rowToObject(row, headers);
    const name = value(record["Tool Name"]);

    if (!name || isPlaceholder(name)) continue;

    const official = normalizeUrl(record["Official Website"]);
    const canonicalKey = official.normalized || `name:${name.toLowerCase()}`;
    const subcategoryNames = splitList(record["Subcategory"]);
    const features = splitList(record["Key Features"]);
    const platforms = splitList(record["Platform"]);
    const useCases = splitList(record["Best Use Cases"]);
    const targetAudiences = splitList(record["Target Audience"]);
    const api = normalizeApi(record["API"]);
    const freePlan = normalizeFreePlan(record["Free Plan"]);
    const verificationStatus = normalizeVerification(
      record["Last Verified"],
      record["Source"],
      record["Status"]
    );

    const required = [
      ["Tool Name", name],
      ["Official Website", official.raw],
      ["Short Description", record["Short Description"]],
      ["Pricing Model", record["Pricing Model"]],
      ["Platform", record["Platform"]],
      ["Status", record["Status"]]
    ];

    for (const [field, fieldValue] of required) {
      if (!value(fieldValue)) {
        importErrors.push({
          sheet: worksheet.name,
          row: rowNumber,
          toolName: name,
          field,
          originalValue: value(fieldValue),
          reason: "Required value missing",
          resolution: "Review workbook row before publishing."
        });
      }
    }

    if (!toolMap.has(canonicalKey)) {
      toolMap.set(canonicalKey, {
        id: slugify(name),
        slug: slugify(name),
        name,
        officialUrl: official.normalized,
        originalOfficialUrl: official.raw,
        domain: official.domain,
        shortDescription: record["Short Description"] || "Information not available",
        categories: [],
        subcategories: [],
        features: [],
        platforms: [],
        useCases: [],
        targetAudiences: [],
        limitations: record["Limitations"] || "Information not available",
        pricing: {
          model: record["Pricing Model"] || "Information not available",
          freePlanRaw: freePlan.raw,
          freePlan: freePlan.normalized,
          startingPriceRaw: record["Starting Price"] || "Information not available"
        },
        api,
        verification: {
          status: verificationStatus,
          lastVerifiedRaw: record["Last Verified"] || "Information not available",
          sourceRaw: record["Source"] || "Information not available"
        },
        status: record["Status"] || "Information not available",
        rawRows: []
      });
    }

    const tool = toolMap.get(canonicalKey);
    addUnique(tool.categories, [categoryName]);
    addUnique(tool.subcategories, subcategoryNames);
    addUnique(tool.features, features);
    addUnique(tool.platforms, platforms);
    addUnique(tool.useCases, useCases);
    addUnique(tool.targetAudiences, targetAudiences);
    tool.rawRows.push({ sheet: worksheet.name, row: rowNumber, categoryName, record });
  }
}

const recentlySheet = workbook.getWorksheet("Recently Added");
if (recentlySheet) {
  recentlySheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const toolName = value(row.getCell(1).value);
    if (!toolName || isPlaceholder(toolName)) return;
    recentlyAdded.push({
      toolName,
      categoryName: value(row.getCell(2).value),
      dateAdded: value(row.getCell(3).value),
      notes: value(row.getCell(4).value)
    });
  });
}

const needsSheet = workbook.getWorksheet("Needs Verification");
if (needsSheet) {
  needsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const toolName = value(row.getCell(1).value);
    if (!toolName || isPlaceholder(toolName)) return;
    needsVerification.push({
      toolName,
      categoryName: value(row.getCell(2).value),
      fields: splitList(row.getCell(3).value),
      notes: value(row.getCell(4).value)
    });
  });
}

const tools = [...toolMap.values()].sort((a, b) => a.name.localeCompare(b.name));
const categoryCounts = new Map();
const subcategoryCounts = new Map();

for (const tool of tools) {
  for (const categoryName of tool.categories) {
    categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
  }
  for (const subcategoryName of tool.subcategories) {
    subcategoryCounts.set(subcategoryName, (subcategoryCounts.get(subcategoryName) || 0) + 1);
  }
}

for (const category of categories) {
  category.toolCount = categoryCounts.get(category.name) || 0;
  category.subcategoryCount =
    subcategories.filter((subcategory) => subcategory.categoryId === category.id).length ||
    category.workbookSubcategoryCount;
  category.exampleSubcategories = subcategories
    .filter((subcategory) => subcategory.categoryId === category.id)
    .slice(0, 4)
    .map((subcategory) => subcategory.name);
}

for (const subcategory of subcategories) {
  subcategory.toolCount = subcategoryCounts.get(subcategory.name) || 0;
}

for (const tool of tools) {
  tool.similarTools = tools
    .filter((candidate) => candidate.slug !== tool.slug)
    .map((candidate) => ({
      slug: candidate.slug,
      score: similarityScore(tool, candidate),
      reason: `Similar category, use-case or feature overlap with ${candidate.name}.`
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

const dataset = {
  generatedAt: new Date().toISOString(),
  sourceWorkbook: workbookPath,
  sheets: workbook.worksheets.map((worksheet) => worksheet.name),
  categories,
  subcategories,
  tools,
  recentlyAdded,
  needsVerification,
  importErrors
};

const summary = {
  generatedAt: dataset.generatedAt,
  sourceWorkbook: workbookPath,
  worksheetCount: workbook.worksheets.length,
  categoryWorksheetCount: categoryWorksheets.length,
  categoryCount: categories.length,
  subcategoryCount: subcategories.length,
  canonicalToolCount: tools.length,
  rawCategoryRows: tools.reduce((sum, tool) => sum + tool.rawRows.length, 0),
  needsVerificationCount: tools.filter((tool) =>
    ["Needs verification", "Not verified", "Partially verified"].includes(tool.verification.status)
  ).length,
  verifiedCount: tools.filter((tool) => tool.verification.status === "Verified").length,
  recentlyAddedCount: recentlyAdded.length,
  importErrorCount: importErrors.length,
  ignoredSheets: [...supportingSheets].filter((sheet) => workbook.getWorksheet(sheet)),
  categorySheets: categoryWorksheets.map((worksheet) => worksheet.name)
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`);
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
