import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Submit an AI Tool | Pluto Finds", description: "Submit an AI tool for duplicate checking and editorial review.", path: "/submit-tool", noIndex: true });

export default function SubmitToolPage() {
  redirect("/?submit-tool=open");
}
