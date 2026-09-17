import type { Metadata } from "next";
import { LegalDraftPage } from "@/components/legal/legal-draft-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Editorial Methodology Draft | Pluto Finds", description: "Draft structure describing how Pluto Finds researches and maintains tool listings.", path: "/editorial-methodology" });
export default function EditorialMethodologyPage() { return <LegalDraftPage title="Editorial methodology" description="Proposed public explanation of sourcing and review." sections={[
  { heading: "Sources and review", points: ["Prefer official product, pricing and documentation sources.", "Record the scope and date of verification.", "Separate provider claims from Pluto Finds observations."] },
  { heading: "Updates and independence", points: ["Recheck material fields when changes are reported.", "Label incomplete or unverified information clearly.", "Document how commercial relationships are kept separate from factual review."] }
]} />; }
