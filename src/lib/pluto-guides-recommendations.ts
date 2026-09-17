import { plutosLibrary, slugify, type LibraryTool } from "@/lib/plutos-library";
import {
  guideBudgets,
  guideGoals,
  guidePlatforms,
  guidePreferences,
  guideRequirements,
  type GuideAnswers,
  type GuideOption,
  type GuideRecommendation
} from "@/lib/pluto-guides-options";

const MAX_RECOMMENDATIONS = 5;

export function getGuideRecommendations(answers: GuideAnswers): GuideRecommendation[] {
  const goal = guideGoals.find((item) => item.id === answers.goal);
  const task = goal?.tasks.find((item) => item.id === answers.primaryTask);
  const relatedTasks = goal?.tasks.filter((item) => answers.relatedTasks.includes(item.id)) ?? [];
  const preferences = guidePreferences.filter(
    (item) => answers.preferences.includes(item.id) && item.id !== "no-strong-preference"
  );
  const budget = guideBudgets.find((item) => item.id === answers.budget);
  const platform = guidePlatforms.find((item) => item.id === answers.platform);
  const requirements = guideRequirements.filter((item) => answers.requirements.includes(item.id));

  if (!goal || !task || !budget) return [];

  const strict = scoreTools({ goal, task, relatedTasks, preferences, budget, platform, requirements }, true);
  const ranked = strict.length >= MAX_RECOMMENDATIONS
    ? strict
    : scoreTools({ goal, task, relatedTasks, preferences, budget, platform, requirements }, false);

  return ranked
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, MAX_RECOMMENDATIONS)
    .map((item, index) => toRecommendation(item.tool, item.score, index, {
      goal,
      task,
      relatedTasks,
      preferences,
      budget,
      platform,
      requirements
    }));
}

type ScoringContext = {
  goal: GuideOption;
  task: GuideOption;
  relatedTasks: GuideOption[];
  preferences: GuideOption[];
  budget: GuideOption;
  platform?: GuideOption;
  requirements: GuideOption[];
};

function scoreTools(context: ScoringContext, strict: boolean) {
  return plutosLibrary.tools
    .map((tool) => ({ tool, score: getToolScore(tool, context, strict) }))
    .filter(({ score }) => score > 0);
}

function getToolScore(tool: LibraryTool, context: ScoringContext, strict: boolean) {
  if (strict && context.budget.id === "free-only" && !hasFreePath(tool)) return 0;
  if (strict && context.requirements.some((item) => item.id === "api-required") && !hasApi(tool)) return 0;
  if (strict && context.platform?.id && !matchesPlatform(tool, context.platform)) return 0;

  let score = 0;
  score += termScore(tool, context.goal.terms, 4);
  score += termScore(tool, context.task.terms, 9);
  score += context.relatedTasks.reduce((total, item) => total + termScore(tool, item.terms, 3), 0);
  score += context.preferences.reduce((total, item) => total + termScore(tool, item.terms, 5), 0);
  score += context.requirements.reduce((total, item) => total + termScore(tool, item.terms, 5), 0);

  if (context.platform?.id) {
    score += matchesPlatform(tool, context.platform) ? 12 : strict ? 0 : -8;
  }

  score += budgetScore(tool, context.budget, strict);
  score += tool.verification.status === "Verified" ? 6 : 0;
  score += Math.min(tool.features.length, 8);
  score += Math.min(tool.similarTools.length, 5);

  return score;
}

function toRecommendation(
  tool: LibraryTool,
  score: number,
  index: number,
  context: ScoringContext
): GuideRecommendation {
  const matchedRequirements = getMatchedRequirements(tool, context);
  const preferenceText = context.preferences.length
    ? `It also lines up with ${context.preferences.map((item) => item.label.toLowerCase()).join(", ")}.`
    : "It balances capability, setup effort, and fit without leaning on a single preference.";
  const budgetText = budgetReason(tool, context.budget);
  const platformText = context.platform?.id && matchesPlatform(tool, context.platform)
    ? `It supports the ${context.platform.label.toLowerCase()} preference.`
    : undefined;

  return {
    slug: tool.slug,
    name: tool.name,
    officialUrl: tool.officialUrl,
    href: `/tools/${tool.slug}`,
    shortDescription: tool.shortDescription,
    categories: tool.categories.slice(0, 2),
    features: tool.features.slice(0, 4),
    platforms: tool.platforms.slice(0, 4),
    pricing: formatPricing(tool),
    api: tool.api.normalized || tool.api.raw || "Unknown",
    verification: tool.verification.status,
    score: Math.round(score),
    fit: index === 0 ? "Best match" : index < 3 ? "Strong match" : "Worth comparing",
    useCase: tool.useCases[0] || context.task.description,
    reasons: [
      `Matches ${context.task.label.toLowerCase()} within ${context.goal.label.toLowerCase()}.`,
      preferenceText,
      budgetText,
      platformText
    ].filter(Boolean) as string[],
    matchedRequirements
  };
}

function termScore(tool: LibraryTool, terms: string[], weight: number) {
  if (terms.length === 0) return 0;
  const fields = [
    [tool.name, 12],
    [tool.shortDescription, 8],
    [tool.categories.join(" "), 7],
    [tool.subcategories.join(" "), 7],
    [tool.features.join(" "), 6],
    [tool.useCases.join(" "), 6],
    [tool.targetAudiences.join(" "), 4],
    [tool.platforms.join(" "), 3],
    [tool.pricing.model, 2],
    [tool.api.raw, 2],
    [tool.limitations, 1]
  ] as const;

  return terms.reduce((total, term) => {
    const normalized = term.toLowerCase();
    return total + fields.reduce((fieldTotal, [value, fieldWeight]) => {
      const text = value.toLowerCase();
      if (text === normalized) return fieldTotal + fieldWeight * weight * 2;
      if (text.includes(normalized)) return fieldTotal + fieldWeight * weight;
      if (slugify(text).includes(slugify(normalized))) return fieldTotal + Math.ceil(fieldWeight * weight * 0.65);
      return fieldTotal;
    }, 0);
  }, 0);
}

function hasFreePath(tool: LibraryTool) {
  const text = `${tool.pricing.model} ${tool.pricing.freePlan} ${tool.pricing.freePlanRaw}`.toLowerCase();
  return tool.pricing.freePlan.toLowerCase() === "yes" || text.includes("free") || text.includes("freemium");
}

function budgetScore(tool: LibraryTool, budget: GuideOption, strict: boolean) {
  const text = `${tool.pricing.model} ${tool.pricing.freePlan} ${tool.pricing.freePlanRaw} ${tool.pricing.startingPriceRaw}`.toLowerCase();
  if (budget.id === "free-only") return hasFreePath(tool) ? 16 : strict ? 0 : -10;
  if (budget.id === "under-20") {
    if (hasFreePath(tool)) return 12;
    const price = Number((tool.pricing.startingPriceRaw.match(/\d+(?:\.\d+)?/) ?? [""])[0]);
    if (price && price <= 20) return 10;
    return text.includes("trial") ? 6 : 0;
  }
  if (budget.id === "business-enterprise") {
    return text.includes("enterprise") || text.includes("business") ? 12 : termText(tool).includes("enterprise") ? 8 : 0;
  }
  return 5;
}

function budgetReason(tool: LibraryTool, budget: GuideOption) {
  if (budget.id === "free-only") {
    return hasFreePath(tool)
      ? "The pricing data indicates a free or freemium path."
      : "It is included as a close match, but pricing should be checked before committing.";
  }
  if (budget.id === "under-20") {
    return "It is prioritized for accessible pricing signals such as free, freemium, trial, or low starting price.";
  }
  if (budget.id === "business-enterprise") {
    return "It has signals that fit business or enterprise evaluation.";
  }
  return "It is ranked mainly by task fit, with budget kept flexible.";
}

function hasApi(tool: LibraryTool) {
  const api = `${tool.api.normalized} ${tool.api.raw}`.toLowerCase();
  return api.includes("yes") || api.includes("limited") || api.includes("enterprise") || api.includes("api");
}

function matchesPlatform(tool: LibraryTool, platform: GuideOption) {
  if (!platform.id) return true;
  if (platform.id === "api") return hasApi(tool);
  const text = `${tool.platforms.join(" ")} ${tool.shortDescription} ${tool.features.join(" ")}`.toLowerCase();
  return platform.terms.some((term) => text.includes(term.toLowerCase()));
}

function getMatchedRequirements(tool: LibraryTool, context: ScoringContext) {
  const matches = [context.budget.label];
  if (context.platform?.id && matchesPlatform(tool, context.platform)) matches.push(context.platform.label);
  for (const requirement of context.requirements) {
    if (requirement.id === "api-required" && hasApi(tool)) matches.push(requirement.label);
    else if (termScore(tool, requirement.terms, 1) > 0) matches.push(requirement.label);
  }
  for (const preference of context.preferences.slice(0, 2)) {
    if (termScore(tool, preference.terms, 1) > 0) matches.push(preference.label);
  }
  return [...new Set(matches)].slice(0, 6);
}

function formatPricing(tool: LibraryTool) {
  const parts = [tool.pricing.model, tool.pricing.startingPriceRaw]
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.join(" - ") || "Pricing not listed";
}

function termText(tool: LibraryTool) {
  return [
    tool.name,
    tool.shortDescription,
    tool.categories.join(" "),
    tool.subcategories.join(" "),
    tool.features.join(" "),
    tool.useCases.join(" "),
    tool.targetAudiences.join(" "),
    tool.platforms.join(" ")
  ].join(" ").toLowerCase();
}
