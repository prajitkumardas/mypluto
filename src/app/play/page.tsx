import type { Metadata } from "next";
import { PlutoPlayground, type PlayRewardTool } from "@/components/play/pluto-playground";
import { plutosLibrary, type LibraryTool } from "@/lib/plutos-library";

export const metadata: Metadata = {
  title: "Play Pluto | Pluto Finds",
  description: "Play a quick game with Pluto and unlock a surprise underrated AI tool if you win."
};

export default function PlayPage() {
  const rewardTools = getRewardTools();
  return <PlutoPlayground rewardTools={rewardTools} />;
}

function getRewardTools(): PlayRewardTool[] {
  const verified = plutosLibrary.tools.filter((tool) =>
    tool.verification.status === "Verified" &&
    Boolean(tool.slug) &&
    Boolean(tool.name) &&
    Boolean(tool.shortDescription)
  );
  const fallback = plutosLibrary.tools.filter((tool) => tool.slug && tool.name && tool.shortDescription);
  const source = verified.length > 0 ? verified : fallback;
  const pool = source.length > 12 ? source.slice(8, 56) : source;

  return pool.slice(0, 36).map(toRewardTool);
}

function toRewardTool(tool: LibraryTool): PlayRewardTool {
  const category = tool.categories[0] || "AI tool";
  const useCase = tool.useCases[0] || tool.subcategories[0] || category;
  const pricing = tool.pricing.model || tool.pricing.freePlan || "See pricing";

  return {
    slug: tool.slug,
    name: tool.name,
    category,
    description: tool.shortDescription,
    domain: tool.domain || tool.officialUrl || tool.originalOfficialUrl,
    pricing,
    useCase,
    whyPicked: `It is a focused ${category.toLowerCase()} find that can help without adding extra noise.`
  };
}