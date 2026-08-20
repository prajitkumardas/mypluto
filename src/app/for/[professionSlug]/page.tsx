import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tools/tool-card";
import { professions, tools } from "@/lib/data";

type ProfessionPageProps = {
  params: Promise<{ professionSlug: string }>;
};

export default async function ProfessionPage({ params }: ProfessionPageProps) {
  const { professionSlug } = await params;
  const profession = professions.find((item) => item.slug === professionSlug);

  if (!profession) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="violet">Profession workflow</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        AI workflows for {profession.title.toLowerCase()}.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">{profession.copy}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {profession.workflows.map((workflow) => (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-900 shadow-card" key={workflow}>
            {workflow}
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.slice(0, 3).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </main>
  );
}
