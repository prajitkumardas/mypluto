import { randomInt, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { plutosLibrary } from "@/lib/plutos-library";
import { findSubmissionDuplicate } from "@/lib/tool-submission-server";
import { isValidEmail, normalizeDomain, normalizeOfficialUrl, normalizeToolName } from "@/components/submissions/validation";
import { platformOptions, pricingModels, relationshipOptions, type ToolSubmissionDraft } from "@/components/submissions/types";

type ValidatedSubmission = {
  toolName: string;
  officialUrl: string;
  normalizedDomain: string;
  normalizedName: string;
  tagline: string;
  category: string;
  pricing: string;
  platforms: string[];
  email: string;
  relationship: string;
  duplicateOverride: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ToolSubmissionDraft> & { websiteField?: unknown };
    if (body.websiteField) return Response.json({ ok: true });
    const validated = validateSubmission(body);
    if (!validated.ok) return Response.json({ error: validated.error }, { status: 400 });

    const duplicate = await findSubmissionDuplicate(validated.data.toolName, validated.data.officialUrl);
    if (duplicate && !validated.data.duplicateOverride) {
      return Response.json({ error: "This tool may already be listed.", duplicate: { name: duplicate.name, slug: duplicate.slug } }, { status: 409 });
    }

    const referenceCode = `PLU-${new Date().getUTCFullYear()}-${randomInt(100000, 1000000)}`;
    const stored = await storeSubmission({ ...validated.data, id: randomUUID(), referenceCode });
    if (!stored) return Response.json({ error: "We couldn't save your submission. Please try again." }, { status: 503 });
    return Response.json({ ok: true, referenceCode });
  } catch {
    return Response.json({ error: "We couldn't submit the tool. Please try again." }, { status: 400 });
  }
}

function validateSubmission(body: Partial<ToolSubmissionDraft>) {
  const officialUrl = typeof body.officialUrl === "string" ? normalizeOfficialUrl(body.officialUrl) : null;
  const toolName = typeof body.toolName === "string" ? body.toolName.trim().slice(0, 120) : "";
  const tagline = typeof body.tagline === "string" ? body.tagline.trim().slice(0, 180) : "";
  const category = typeof body.primaryCategory === "string" ? body.primaryCategory : "";
  const pricing = typeof body.pricingModel === "string" ? body.pricingModel : "";
  const email = typeof body.submitterEmail === "string" ? body.submitterEmail.trim().toLowerCase() : "";
  const relationship = typeof body.relationship === "string" ? body.relationship.trim().slice(0, 80) : "";
  const platforms = Array.isArray(body.platforms) ? body.platforms.filter((item): item is string => typeof item === "string" && platformOptions.includes(item as typeof platformOptions[number])) : [];
  if (!toolName || !officialUrl) return { ok: false as const, error: "Enter a valid tool name and official URL." };
  if (!tagline || !plutosLibrary.categories.some((item) => item.slug === category)) return { ok: false as const, error: "Complete the required product details." };
  if (!pricingModels.includes(pricing as typeof pricingModels[number]) || !isValidEmail(email) || body.confirmed !== true) return { ok: false as const, error: "Complete the required submitter and confirmation details." };
  if (relationship && !relationshipOptions.includes(relationship as typeof relationshipOptions[number])) return { ok: false as const, error: "Select a valid relationship to the product." };
  return { ok: true as const, data: { toolName, officialUrl, normalizedDomain: normalizeDomain(officialUrl), normalizedName: normalizeToolName(toolName), tagline, category, pricing, platforms, email, relationship, duplicateOverride: body.duplicateOverride === true } };
}

async function storeSubmission(data: ValidatedSubmission & { id: string; referenceCode: string }) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.from("tool_submissions").insert({
    id: data.id,
    reference_code: data.referenceCode,
    status: "pending_review",
    tool_name: data.toolName,
    normalized_name: data.normalizedName,
    official_url: data.officialUrl,
    normalized_domain: data.normalizedDomain,
    tagline: data.tagline,
    category_slug: data.category,
    pricing_model: data.pricing,
    platforms: data.platforms,
    submitter_email: data.email,
    relationship: data.relationship || null,
    duplicate_override: data.duplicateOverride
  });
  return !error;
}
