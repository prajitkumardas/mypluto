import type { Metadata } from "next";
import { LegalDraftPage } from "@/components/legal/legal-draft-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Terms of Use Draft | Pluto Finds", description: "Draft structure for Pluto Finds terms of use, pending legal review.", path: "/terms" });
export default function TermsPage() { return <LegalDraftPage title="Terms of Use" description="Proposed sections for the terms governing use of Pluto Finds." sections={[
  { heading: "Using the service", points: ["Eligibility and acceptance of the terms.", "Permitted personal and business use.", "Prohibited misuse, interference and automated abuse."] },
  { heading: "Content and listings", points: ["Ownership and licence for submitted tool information.", "Review, correction, refusal and removal rights.", "Third-party tool ownership and availability."] },
  { heading: "Risk and administration", points: ["Disclaimers and limitations subject to applicable law.", "Suspension, termination and service changes.", "Governing law, dispute process, contact and change notices."] }
]} />; }
