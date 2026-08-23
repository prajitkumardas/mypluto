import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/lib/data";

export default function UseCasesPage() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="lime">Use cases</Badge>
      <h1 className="mt-4 type-h1 text-neutral-900">
        Start from the job, then review prioritized recommendations.
      </h1>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {useCases.map((useCase) => (
          <Link
            className="focus-ring group rounded-3xl border border-neutral-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet-500"
            href={`/use-cases/${useCase.slug}`}
            key={useCase.slug}
          >
            <h2 className="type-h3 text-neutral-900">{useCase.title}</h2>
            <p className="mt-3 type-body-sm text-neutral-700">{useCase.query}</p>
            <span className="mt-6 inline-flex items-center gap-2 type-label-md text-violet-600">
              View recommendations <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
