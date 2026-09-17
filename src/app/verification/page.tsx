import { ShieldCheck } from "lucide-react";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Verification Methodology | Pluto Finds", description: "Learn how Pluto Finds checks tool websites, pricing and key product information.", path: "/verification" });

export default function VerificationPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Verification methodology"
        eyebrowTone="success"
        title="Trust is workflow, not a decorative badge."
      />
      <CardGrid>
        {["Website available", "Pricing checked", "Features reviewed"].map((item) => (
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-xs)]" key={item}>
            <ShieldCheck aria-hidden="true" className="h-7 w-7 text-[var(--color-pluto-purple-300)]" />
            <h2 className="mt-5 type-h2 text-[var(--text-primary)]">{item}</h2>
            <p className="mt-3 type-body-sm text-[var(--text-secondary)]">
              AI can detect possible changes, but admin review is required before critical data is published.
            </p>
          </div>
        ))}
      </CardGrid>
    </PageShell>
  );
}
import type { Metadata } from "next";
