import { Metadata } from "next";
import { PlutoGuidesFlow } from "@/components/pluto-guides/pluto-guides-flow";

export const metadata: Metadata = {
  title: "Pluto Guides | PlutoFinds",
  description: "Answer four questions and get ranked AI tool recommendations from the PlutoFinds library."
};

export default function PlutoGuidesPage() {
  return <PlutoGuidesFlow />;
}
