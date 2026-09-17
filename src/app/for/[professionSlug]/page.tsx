import { notFound } from "next/navigation";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { professions, tools } from "@/lib/data";
import { createPageMetadata } from "@/lib/seo";

type ProfessionPageProps = {
  params: Promise<{ professionSlug: string }>;
};

export async function generateMetadata({ params }: ProfessionPageProps): Promise<Metadata> {
  const { professionSlug } = await params;
  const profession = professions.find((item) => item.slug === professionSlug);
  if (!profession) return createPageMetadata({ title: "Profession not found | Pluto Finds", description: "This profession guide could not be found.", path: `/for/${professionSlug}`, noIndex: true });
  return createPageMetadata({ title: `AI Tools for ${profession.title} | Pluto Finds`, description: profession.copy, path: `/for/${profession.slug}` });
}

export default async function ProfessionPage({ params }: ProfessionPageProps) {
  const { professionSlug } = await params;
  const profession = professions.find((item) => item.slug === professionSlug);

  if (!profession) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Profession workflow"
        title={`AI workflows for ${profession.title.toLowerCase()}.`}
        description={profession.copy}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {profession.workflows.map((workflow) => (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-4 type-label-md text-[var(--text-primary)] shadow-[var(--shadow-xs)]" key={workflow}>
            {workflow}
          </div>
        ))}
      </div>
      <CardGrid>
        {tools.slice(0, 3).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </CardGrid>
    </PageShell>
  );
}
import type { Metadata } from "next";
