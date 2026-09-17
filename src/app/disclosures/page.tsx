import type { Metadata } from "next";
import { LegalDraftPage } from "@/components/legal/legal-draft-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Commercial Disclosures Draft | Pluto Finds", description: "Draft structure for Pluto Finds affiliate and sponsorship disclosures.", path: "/disclosures" });
export default function DisclosuresPage() { return <LegalDraftPage title="Affiliate and sponsorship disclosure" description="Proposed disclosure structure for current and future commercial relationships." sections={[
  { heading: "Relationship labels", points: ["Identify affiliate links adjacent to affected actions.", "Label sponsored placements prominently and consistently.", "State whether compensation influences inclusion, review or ranking."] },
  { heading: "Governance", points: ["Maintain a current inventory of commercial partners.", "Separate sales approval from editorial verification.", "Publish material updates to this disclosure."] }
]} />; }
