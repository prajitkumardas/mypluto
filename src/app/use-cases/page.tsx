import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { useCases } from "@/lib/data";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Tool Use Cases | Pluto Finds",
  description: "Start with the job you need to complete and review focused AI tool recommendations.",
  path: "/use-cases"
});

export default function UseCasesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Use cases"
        eyebrowTone="lime"
        title="Start from the job, then review prioritized recommendations."
      />
      <CardGrid>
        {useCases.map((useCase) => (
          <Link
            className="focus-ring group rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-xs)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-brand)] hover:bg-[var(--surface-hover)]"
            href={`/use-cases/${useCase.slug}`}
            key={useCase.slug}
          >
            <h2 className="type-h2 text-[var(--text-primary)]">{useCase.title}</h2>
            <p className="mt-3 type-body-sm text-[var(--text-secondary)]">{useCase.query}</p>
            <span className="mt-6 inline-flex items-center gap-2 type-label-md text-[var(--color-pluto-purple-300)]">
              View recommendations <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </CardGrid>
    </PageShell>
  );
}
