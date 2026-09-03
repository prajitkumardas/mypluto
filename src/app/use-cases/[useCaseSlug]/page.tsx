import { notFound } from "next/navigation";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { tools, useCases } from "@/lib/data";

type UseCasePageProps = {
  params: Promise<{ useCaseSlug: string }>;
};

export default async function UseCasePage({ params }: UseCasePageProps) {
  const { useCaseSlug } = await params;
  const useCase = useCases.find((item) => item.slug === useCaseSlug);

  if (!useCase) {
    notFound();
  }

  const recommended = useCase.tools
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Use-case recommendations"
        eyebrowTone="lime"
        title={useCase.title}
        description={useCase.query}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {useCase.groups.map((group) => (
          <div className="rounded-[var(--radius-lg)] border border-[rgba(200,255,90,0.28)] bg-[rgba(200,255,90,0.1)] p-4 type-label-md text-[var(--text-brand)]" key={group}>
            {group}
          </div>
        ))}
      </div>
      <CardGrid>
        {recommended.map((tool) =>
          tool ? <ToolCard key={tool.slug} tool={tool} /> : null
        )}
      </CardGrid>
    </PageShell>
  );
}