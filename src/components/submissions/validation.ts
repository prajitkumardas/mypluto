import type { ToolSubmissionDraft } from "./types";

export function normalizeOfficialUrl(value: string) {
  const input = value.trim();
  if (!input) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname.includes(".")) return null;
    parsed.protocol = "https:";
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (parsed.pathname === "/") parsed.pathname = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function normalizeDomain(value: string) {
  const normalized = normalizeOfficialUrl(value);
  return normalized ? new URL(normalized).hostname.replace(/^www\./, "") : "";
}

export function normalizeToolName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 254;
}

export function validateIdentity(draft: ToolSubmissionDraft) {
  const errors: Record<string, string> = {};
  if (!draft.toolName.trim()) errors.toolName = "Enter the tool name.";
  else if (draft.toolName.trim().length > 120) errors.toolName = "Keep the tool name under 120 characters.";
  if (!draft.officialUrl.trim()) errors.officialUrl = "Enter the official website URL.";
  else if (!normalizeOfficialUrl(draft.officialUrl)) errors.officialUrl = "Enter a valid official website URL.";
  return errors;
}

export function validateProduct(draft: ToolSubmissionDraft) {
  const errors: Record<string, string> = {};
  if (!draft.tagline.trim()) errors.tagline = "Add a short product tagline.";
  else if (draft.tagline.trim().length > 180) errors.tagline = "Keep the tagline under 180 characters.";
  if (!draft.primaryCategory) errors.primaryCategory = "Choose a primary category.";
  if (!draft.pricingModel) errors.pricingModel = "Choose a pricing model.";
  return errors;
}

export function validateSubmitter(draft: ToolSubmissionDraft): Record<string, string> {
  return isValidEmail(draft.submitterEmail) ? {} : { submitterEmail: "Enter a valid email address." };
}
