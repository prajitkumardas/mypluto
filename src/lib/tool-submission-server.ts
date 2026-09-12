import "server-only";

import { createClient } from "@supabase/supabase-js";
import { plutosLibrary } from "@/lib/plutos-library";
import { normalizeDomain, normalizeToolName } from "@/components/submissions/validation";
import type { DuplicateTool } from "@/components/submissions/types";

export async function findSubmissionDuplicate(toolName: string, officialUrl: string): Promise<DuplicateTool | null> {
  const domain = normalizeDomain(officialUrl);
  const normalizedName = normalizeToolName(toolName);
  const domainMatch = plutosLibrary.tools.find((tool) => normalizeDomain(tool.officialUrl || tool.domain) === domain);
  const nameMatch = plutosLibrary.tools.find((tool) => normalizeToolName(tool.name) === normalizedName);
  const match = domainMatch ?? nameMatch;
  if (match) return { slug: match.slug, name: match.name, domain: match.domain || normalizeDomain(match.officialUrl), officialUrl: match.officialUrl, confidence: domainMatch ? "domain" : "name" };
  try {
    return await findRemoteDuplicate(domain, toolName, normalizedName, officialUrl);
  } catch {
    return null;
  }
}

async function findRemoteDuplicate(domain: string, name: string, normalizedName: string, officialUrl: string): Promise<DuplicateTool | null> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey ?? publicKey;
  if (!url || !key) return null;
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4_000) })
    }
  });
  const select = "slug,name,normalized_domain,official_url,website_url";
  const [{ data: domainRows }, { data: nameRows }] = await Promise.all([
    supabase.from("tools").select(select).eq("is_active", true).eq("normalized_domain", domain).limit(1),
    supabase.from("tools").select(select).eq("is_active", true).ilike("name", name.trim()).limit(1)
  ]);
  const row = domainRows?.[0] ?? nameRows?.[0];
  if (row && typeof row.slug === "string" && typeof row.name === "string") {
    const rowDomain = typeof row.normalized_domain === "string" ? row.normalized_domain : domain;
    const rowUrl = typeof row.official_url === "string" ? row.official_url : typeof row.website_url === "string" ? row.website_url : `https://${rowDomain}`;
    return { slug: row.slug, name: row.name, domain: rowDomain, officialUrl: rowUrl, confidence: domainRows?.[0] ? "domain" : "name" };
  }
  if (!serviceKey) return null;
  const { data: pendingRows } = await supabase.from("tool_submissions").select("tool_name,normalized_domain,official_url").in("status", ["pending_review", "needs_changes"]).or(`normalized_domain.eq.${domain},normalized_name.eq.${normalizedName}`).limit(1);
  const pending = pendingRows?.[0];
  if (!pending || typeof pending.tool_name !== "string") return null;
  return { name: pending.tool_name, domain: typeof pending.normalized_domain === "string" ? pending.normalized_domain : domain, officialUrl: typeof pending.official_url === "string" ? pending.official_url : officialUrl, confidence: pending.normalized_domain === domain ? "domain" : "name" };
}
