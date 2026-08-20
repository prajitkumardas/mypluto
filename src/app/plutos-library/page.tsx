import Link from "next/link";
import { Database, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryCard } from "@/components/library/category-card";
import { LibrarySearch } from "@/components/library/library-search";
import { TrendingTools } from "@/components/library/trending-tools";
import { getLibraryStatistics, getTrendingTools, plutosLibrary } from "@/lib/plutos-library";

type PlutosLibraryPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    verification?: string;
  }>;
};

export default async function PlutosLibraryPage({ searchParams }: PlutosLibraryPageProps) {
  const params = await searchParams;
  const stats = getLibraryStatistics();

  return (
    <main className="bg-canvas">
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <nav className="text-sm font-semibold text-neutral-500">
          <Link className="hover:text-violet-600" href="/">
            Home
          </Link>{" "}
          / Pluto&apos;s Library
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_0.65fr] lg:items-end">
          <div>
            <Badge tone="violet">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Explore 700+ AI tools
            </Badge>
            <h1 className="mt-4 max-w-4xl font-heading text-5xl font-bold text-neutral-900 sm:text-6xl">
              Find the right AI tool for your next task.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
              Search hundreds of AI tools by category, pricing, platform,
              features and use case. Verification status is labelled clearly so
              research starts from honest data.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Database aria-hidden="true" className="h-6 w-6 text-violet-600" />
              <h2 className="font-heading text-2xl font-bold text-neutral-900">
                Library snapshot
              </h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="AI tools available" value={stats.tools} />
              <Metric label="Categories available" value={stats.categories} />
              <Metric label="Free tools" value={stats.freeTools} />
              <Metric label="Verified tools" value={stats.verifiedTools} />
            </dl>
          </div>
        </div>

        <LibrarySearch
          categories={plutosLibrary.categories}
          initial={{
            q: params.q,
            category: params.category,
            verification: params.verification
          }}
        />
      </section>

      <section className="mx-auto max-w-site px-5 pb-16 sm:px-8 xl:px-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge tone="lime">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              All categories
            </Badge>
            <h2 className="mt-3 font-heading text-4xl font-bold text-neutral-900">
              Explore AI tools by category
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plutosLibrary.categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <TrendingTools
        toolsByRange={{
          today: getTrendingTools("today", 8),
          week: getTrendingTools("week", 8),
          month: getTrendingTools("month", 8),
          all: getTrendingTools("all", 8)
        }}
      />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-3">
      <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
      <dd className="number mt-1 font-heading text-2xl font-bold text-neutral-900">
        {value}
      </dd>
    </div>
  );
}
