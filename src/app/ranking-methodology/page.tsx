import type { Metadata } from "next";
import { LegalDraftPage } from "@/components/legal/legal-draft-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Ranking Methodology Draft | Pluto Finds", description: "Draft structure for explaining Pluto Finds rankings and recommendations.", path: "/ranking-methodology" });
export default function RankingMethodologyPage() { return <LegalDraftPage title="Ranking methodology" description="Proposed disclosure for Trending, Guides and ordered recommendations." sections={[
  { heading: "Ranking inputs", points: ["Define each usage, popularity, freshness and editorial signal.", "Document fallback behavior when live trend snapshots are unavailable.", "Explain weighting, refresh cadence and minimum data thresholds."] },
  { heading: "Controls and commercial influence", points: ["Describe quality checks and manipulation safeguards.", "Disclose whether sponsorship can affect placement; default proposal is that it must not affect organic rank.", "Provide a visible label for any paid placement."] }
]} />; }
