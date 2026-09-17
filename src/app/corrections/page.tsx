import type { Metadata } from "next";
import { LegalDraftPage } from "@/components/legal/legal-draft-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Corrections and Removal Draft | Pluto Finds", description: "Draft process for requesting a Pluto Finds listing correction or removal.", path: "/corrections" });
export default function CorrectionsPage() { return <LegalDraftPage title="Tool corrections and removal" description="Proposed operational process for tool providers and users." sections={[
  { heading: "Submitting a request", points: ["Provide the listing URL, requested change and supporting official source.", "Explain how an authorized provider representative can identify themselves.", "Publish a monitored contact channel and acknowledgement timeframe."] },
  { heading: "Review and outcome", points: ["Triage security, impersonation and legal complaints urgently.", "Verify material corrections against primary sources.", "Record the decision, update date and appeal or escalation path."] }
]} />; }
