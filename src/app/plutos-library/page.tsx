import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryCard } from "@/components/library/category-card";
import { LibrarySearch } from "@/components/library/library-search";
import { TrendingTools } from "@/components/library/trending-tools";
import { getTrendingTools, plutosLibrary } from "@/lib/plutos-library";

type PlutosLibraryPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    verification?: string;
  }>;
};

export default async function PlutosLibraryPage({ searchParams }: PlutosLibraryPageProps) {
  const params = await searchParams;

  return (
    <main className="bg-canvas">
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <nav className="type-label-md text-neutral-500">
          <Link className="hover:text-violet-600" href="/">
            Home
          </Link>{" "}
          / Discover
        </nav>

        <div className="mt-6 max-w-4xl">
          <Badge tone="violet">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Explore 700+ AI tools
            </Badge>
          <h1 className="mt-4 type-h1 text-neutral-900">
              Discover the right AI tool
            </h1>
          <p className="mt-5 max-w-2xl type-body-xl text-neutral-700">
            Browse trusted AI tools by category, use case, platform, pricing, and capability.
            </p>
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
            <h2 className="mt-3 type-h2 text-neutral-900">
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




