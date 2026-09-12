export const submissionSteps = [
  { id: "identity", label: "Tool identity" },
  { id: "duplicate", label: "Duplicate check" },
  { id: "product", label: "Product details" },
  { id: "submitter", label: "Submitter info" },
  { id: "review", label: "Review" }
] as const;

export type SubmissionStage = "intro" | "resume" | "identity" | "checking" | "duplicate" | "product" | "submitter" | "review" | "submitting" | "success";

export type ToolSubmissionDraft = {
  toolName: string;
  officialUrl: string;
  tagline: string;
  primaryCategory: string;
  pricingModel: string;
  platforms: string[];
  submitterEmail: string;
  relationship: string;
  duplicateOverride: boolean;
  confirmed: boolean;
};

export type DuplicateTool = {
  slug?: string;
  name: string;
  domain: string;
  officialUrl: string;
  confidence: "domain" | "name";
};

export type SubmissionCategory = { name: string; slug: string };

export const emptySubmissionDraft: ToolSubmissionDraft = {
  toolName: "",
  officialUrl: "",
  tagline: "",
  primaryCategory: "",
  pricingModel: "",
  platforms: [],
  submitterEmail: "",
  relationship: "",
  duplicateOverride: false,
  confirmed: false
};

export const pricingModels = ["Free", "Freemium", "Paid", "Open source", "Contact for pricing"] as const;
export const platformOptions = ["Web", "iOS", "Android", "macOS", "Windows", "Linux", "Browser extension", "API", "Other"] as const;
export const relationshipOptions = ["User", "Founder / Team member", "Agency / Representative", "Community contributor", "Other"] as const;
