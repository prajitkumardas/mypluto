import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="lime">Use-case recommendations</Badge>
      <h1 className="mt-4 type-h1 text-neutral-900">
        {useCase.title}
      </h1>
      <p className="mt-4 max-w-2xl type-body-xl text-neutral-700">{useCase.query}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {useCase.groups.map((group) => (
          <div className="rounded-2xl bg-lime-100 p-4 type-label-md text-ink-950" key={group}>
            {group}
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {recommended.map((tool) =>
          tool ? <ToolCard key={tool.slug} tool={tool} /> : null
        )}
      </div>
    </main>
  );
}
