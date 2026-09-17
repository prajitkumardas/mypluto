import type { Metadata } from "next";
import { LegalDraftPage } from "@/components/legal/legal-draft-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Disclaimer Draft | Pluto Finds", description: "Draft structure for Pluto Finds product and information disclaimers.", path: "/disclaimer" });
export default function DisclaimerPage() { return <LegalDraftPage title="Disclaimer" description="Boundaries for directory information and third-party AI tools." sections={[
  { heading: "Information scope", points: ["Listings are informational and may become outdated.", "Verification is a documented review signal, not an endorsement or warranty.", "Users should confirm pricing, terms, security and suitability with the provider."] },
  { heading: "Third-party products", points: ["Pluto Finds does not operate listed third-party tools.", "External services have their own terms, privacy practices and risks.", "Professional, legal, medical and financial decisions require qualified advice."] }
]} />; }
