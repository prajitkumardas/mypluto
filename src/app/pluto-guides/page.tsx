import { Metadata } from "next";
import { PlutoGuidesFlow } from "@/components/pluto-guides/pluto-guides-flow";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Pluto Guides | Pluto Finds", description: "Answer four questions and get ranked AI tool recommendations from the Pluto Finds library.", path: "/pluto-guides" });

export default function PlutoGuidesPage() {
  return <PlutoGuidesFlow />;
}
