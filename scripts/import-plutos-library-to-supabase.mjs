import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");
const datasetPath = path.join(rootDir, "src/data/generated/plutos-library.json");
const summaryPath = path.join(rootDir, "src/data/generated/plutos-library-summary.json");

const batchSize = 200;

const env = await loadEnv(envPath);
const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

const datasetRaw = await readFile(datasetPath, "utf8");
const dataset = JSON.parse(datasetRaw);
const summary = JSON.parse(await readFile(summaryPath, "utf8"));
const sourceHash = createHash("sha256").update(datasetRaw).digest("hex");

const report = {
  sourceWorkbook: dataset.sourceWorkbook,
  sourceHash,
  categories: dataset.categories.length,
  subcategories: dataset.subcategories.length,
  tools: dataset.tools.length,
  toolCategories: 0,
  toolSubcategories: 0,
  features: 0,
  platforms: 0,
  useCases: 0,
  targetAudiences: 0,
  pricingRecords: 0,
  verificationRecords: 0,
  importErrors: dataset.importErrors.length
};

console.log("Starting Pluto's Library Supabase import...");

const { data: importRecord } = await upsertSingle("tool_imports", {
  source_filename: dataset.sourceWorkbook,
  source_hash: sourceHash,
  worksheet_count: summary.worksheetCount,
  category_sheet_count: summary.categoryWorksheetCount,
  canonical_tool_count: summary.canonicalToolCount,
  import_error_count: summary.importErrorCount,
  summary
});

await upsertRows(
  "categories",
  dataset.categories.map((category, index) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    workbook_tool_count: category.workbookToolCount ?? category.toolCount ?? 0,
    workbook_subcategory_count: category.workbookSubcategoryCount ?? category.subcategoryCount ?? 0,
    tool_count: category.toolCount ?? 0,
    subcategory_count: category.subcategoryCount ?? 0,
    display_order: index + 1,
    is_active: true,
    updated_at: new Date().toISOString()
  })),
  "slug"
);

const categories = await selectAll("categories", "id, slug, name");
const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
const categoryByName = new Map(categories.map((category) => [category.name.toLowerCase(), category]));

await upsertRows(
  "subcategories",
  dataset.subcategories
    .map((subcategory) => {
      const category = categoryBySlug.get(subcategory.categoryId);
      if (!category) return null;
      return {
        category_id: category.id,
        slug: subcategory.slug,
        name: subcategory.name,
        tool_count: subcategory.toolCount ?? 0,
        is_active: true,
        updated_at: new Date().toISOString()
      };
    })
    .filter(Boolean),
  "category_id,slug"
);

const subcategories = await selectAll("subcategories", "id, category_id, slug, name");
const subcategoryByCategoryAndSlug = new Map(
  subcategories.map((subcategory) => [`${subcategory.category_id}:${subcategory.slug}`, subcategory])
);

const toolRows = dataset.tools.map((tool) => {
  const primaryCategory = tool.categories
    .map((name) => categoryByName.get(name.toLowerCase()))
    .find(Boolean);
  const primarySubcategory = primaryCategory
    ? tool.subcategories
        .map((name) => subcategoryByCategoryAndSlug.get(`${primaryCategory.id}:${slugify(name)}`))
        .find(Boolean)
    : null;

  return {
    slug: tool.slug,
    name: tool.name,
    official_url: tool.officialUrl || null,
    original_official_url: tool.originalOfficialUrl || null,
    normalized_domain: tool.domain || null,
    short_description: tool.shortDescription,
    full_description: tool.shortDescription,
    category_id: primaryCategory?.id ?? null,
    subcategory_id: primarySubcategory?.id ?? null,
    website_url: tool.officialUrl || tool.originalOfficialUrl || null,
    pricing_type: tool.pricing.model,
    starting_price_raw: tool.pricing.startingPriceRaw,
    has_free_plan: normalizeBoolean(tool.pricing.freePlan),
    platforms: tool.platforms,
    api_available: normalizeApiAvailable(tool.api.normalized),
    best_for: tool.useCases,
    target_audience: tool.targetAudiences,
    key_features: tool.features,
    limitations: tool.limitations,
    limitations_list: tool.limitations ? [tool.limitations] : [],
    api_status: tool.api.normalized,
    api_raw: tool.api.raw,
    api_notes: tool.api.notes,
    verification_status: normalizeVerificationStatus(tool.verification.status),
    status: tool.status,
    is_active: !tool.verification.status.toLowerCase().includes("unavailable"),
    last_verified_at: parseDate(tool.verification.lastVerifiedRaw),
    updated_at: new Date().toISOString()
  };
});

await upsertRows("tools", toolRows, "slug");

const tools = await selectAll("tools", "id, slug, name");
const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

const toolCategoryRows = [];
const toolSubcategoryRows = [];
const pricingRows = [];
const verificationRows = [];
const sourceNames = new Set();
const featureNames = new Map();
const platformNames = new Map();
const useCaseNames = new Map();
const audienceNames = new Map();

for (const tool of dataset.tools) {
  const savedTool = toolBySlug.get(tool.slug);
  if (!savedTool) continue;

  for (const categoryName of tool.categories) {
    const category = categoryByName.get(categoryName.toLowerCase());
    if (category) {
      toolCategoryRows.push({ tool_id: savedTool.id, category_id: category.id });
    }
  }

  for (const categoryName of tool.categories) {
    const category = categoryByName.get(categoryName.toLowerCase());
    if (!category) continue;
    for (const subcategoryName of tool.subcategories) {
      const subcategory = subcategoryByCategoryAndSlug.get(`${category.id}:${slugify(subcategoryName)}`);
      if (subcategory) {
        toolSubcategoryRows.push({ tool_id: savedTool.id, subcategory_id: subcategory.id });
      }
    }
  }

  pricingRows.push({
    tool_id: savedTool.id,
    pricing_model: tool.pricing.model,
    pricing_model_raw: tool.pricing.model,
    free_plan_status: tool.pricing.freePlan,
    free_plan_raw: tool.pricing.freePlanRaw,
    starting_price_raw: tool.pricing.startingPriceRaw,
    source: tool.verification.sourceRaw
  });

  verificationRows.push({
    tool_id: savedTool.id,
    verification_status: tool.verification.status,
    last_verified_raw: tool.verification.lastVerifiedRaw,
    verified_at: parseDate(tool.verification.lastVerifiedRaw),
    source_raw: tool.verification.sourceRaw
  });

  if (tool.verification.sourceRaw) sourceNames.add(tool.verification.sourceRaw);
  addNamed(featureNames, tool.features);
  addNamed(platformNames, tool.platforms);
  addNamed(useCaseNames, tool.useCases);
  addNamed(audienceNames, tool.targetAudiences);
}

await upsertRows("tool_categories", uniqueRows(toolCategoryRows, ["tool_id", "category_id"]), "tool_id,category_id");
await upsertRows("tool_subcategories", uniqueRows(toolSubcategoryRows, ["tool_id", "subcategory_id"]), "tool_id,subcategory_id");

await replaceChildRows("pricing_records", "tool_id", tools.map((tool) => tool.id), pricingRows);
await replaceChildRows("verification_records", "tool_id", tools.map((tool) => tool.id), verificationRows);

await upsertNamedRows("features", featureNames);
await upsertNamedRows("platforms", platformNames);
await upsertNamedRows("use_cases", useCaseNames);
await upsertNamedRows("target_audiences", audienceNames);

await upsertRows(
  "sources",
  [...sourceNames].map((raw_source) => ({ raw_source })),
  "raw_source"
);

await linkNamedRows("features", "tool_features", "feature_id", "features", dataset.tools, toolBySlug);
await linkNamedRows("platforms", "tool_platforms", "platform_id", "platforms", dataset.tools, toolBySlug);
await linkNamedRows("use_cases", "tool_use_cases", "use_case_id", "useCases", dataset.tools, toolBySlug);
await linkNamedRows("target_audiences", "tool_target_audiences", "target_audience_id", "targetAudiences", dataset.tools, toolBySlug);
await linkSources(dataset.tools, toolBySlug);
await linkSimilarTools(dataset.tools, toolBySlug);

if (dataset.importErrors.length > 0 && importRecord?.id) {
  await upsertRows(
    "import_errors",
    dataset.importErrors.map((error) => ({
      import_id: importRecord.id,
      sheet_name: error.sheet,
      row_number: error.row,
      tool_name: error.toolName,
      field_name: error.field,
      original_value: error.originalValue,
      error_reason: error.reason,
      recommended_resolution: error.resolution
    }))
  );
}

report.toolCategories = toolCategoryRows.length;
report.toolSubcategories = toolSubcategoryRows.length;
report.features = featureNames.size;
report.platforms = platformNames.size;
report.useCases = useCaseNames.size;
report.targetAudiences = audienceNames.size;
report.pricingRecords = pricingRows.length;
report.verificationRecords = verificationRows.length;

console.log(JSON.stringify(report, null, 2));

async function loadEnv(filePath) {
  const raw = await readFile(filePath, "utf8");
  return raw.split(/\r?\n/).reduce((values, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return values;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) return values;
    values[match[1].trim()] = match[2].trim();
    return values;
  }, {});
}

async function upsertSingle(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select("id").single();
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return { data };
}

async function upsertRows(table, rows, onConflict) {
  if (rows.length === 0) return [];
  const results = [];
  for (const chunk of chunks(rows, batchSize)) {
    const query = supabase.from(table).upsert(chunk, onConflict ? { onConflict } : undefined);
    const { data, error } = await query.select();
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
    if (data) results.push(...data);
  }
  return results;
}

async function selectAll(table, columns) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + 999);
    if (error) throw new Error(`${table} select failed: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
    from += 1000;
  }
  return rows;
}

async function replaceChildRows(table, matchColumn, ids, rows) {
  for (const chunk of chunks(ids, batchSize)) {
    const { error } = await supabase.from(table).delete().in(matchColumn, chunk);
    if (error) throw new Error(`${table} cleanup failed: ${error.message}`);
  }
  await upsertRows(table, rows);
}

async function upsertNamedRows(table, names) {
  await upsertRows(
    table,
    [...names.entries()].map(([normalized_name, raw_name]) => ({
      normalized_name,
      raw_name
    })),
    "normalized_name"
  );
}

async function linkNamedRows(entityTable, linkTable, entityIdColumn, toolProperty, toolsData, toolBySlug) {
  const entities = await selectAll(entityTable, "id, normalized_name");
  const entityByName = new Map(entities.map((entity) => [entity.normalized_name, entity]));
  const rows = [];

  for (const tool of toolsData) {
    const savedTool = toolBySlug.get(tool.slug);
    if (!savedTool) continue;
    for (const rawValue of tool[toolProperty] ?? []) {
      const entity = entityByName.get(slugify(rawValue));
      if (entity) {
        rows.push({
          tool_id: savedTool.id,
          [entityIdColumn]: entity.id,
          raw_value: rawValue
        });
      }
    }
  }

  await upsertRows(linkTable, uniqueRows(rows, ["tool_id", entityIdColumn]), `tool_id,${entityIdColumn}`);
}

async function linkSources(toolsData, toolBySlug) {
  const sources = await selectAll("sources", "id, raw_source");
  const sourceByRaw = new Map(sources.map((source) => [source.raw_source, source]));
  const rows = [];

  for (const tool of toolsData) {
    const savedTool = toolBySlug.get(tool.slug);
    const source = sourceByRaw.get(tool.verification.sourceRaw);
    if (savedTool && source) {
      rows.push({ tool_id: savedTool.id, source_id: source.id });
    }
  }

  await upsertRows("tool_sources", uniqueRows(rows, ["tool_id", "source_id"]), "tool_id,source_id");
}

async function linkSimilarTools(toolsData, toolBySlug) {
  const rows = [];
  for (const tool of toolsData) {
    const savedTool = toolBySlug.get(tool.slug);
    if (!savedTool) continue;
    for (const similar of tool.similarTools ?? []) {
      const similarTool = toolBySlug.get(similar.slug);
      if (similarTool) {
        rows.push({
          tool_id: savedTool.id,
          similar_tool_id: similarTool.id,
          score: similar.score,
          explanation: similar.reason
        });
      }
    }
  }

  await upsertRows("similar_tool_scores", uniqueRows(rows, ["tool_id", "similar_tool_id"]), "tool_id,similar_tool_id");
}

function addNamed(target, values) {
  for (const value of values ?? []) {
    const normalized = slugify(value);
    if (normalized && !target.has(normalized)) {
      target.set(normalized, value);
    }
  }
}

function uniqueRows(rows, keys) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keys.map((item) => row[item]).join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function chunks(rows, size) {
  const output = [];
  for (let index = 0; index < rows.length; index += size) {
    output.push(rows.slice(index, index + size));
  }
  return output;
}

function slugify(input) {
  return String(input ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizeBoolean(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "yes" || normalized.includes("free")) return true;
  if (normalized === "no") return false;
  return null;
}

function normalizeApiAvailable(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "yes" || normalized.includes("limited") || normalized.includes("enterprise")) return true;
  if (normalized === "no") return false;
  return null;
}

function normalizeVerificationStatus(value) {
  const normalized = slugify(value).replaceAll("-", "_");
  return normalized || "needs_verification";
}

function parseDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}
