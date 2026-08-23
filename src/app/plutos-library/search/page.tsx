import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LibrarySearch } from "@/components/library/library-search";
import { SearchResults } from "@/components/library/search-results";
import { getLibrarySearchResults, plutosLibrary } from "@/lib/plutos-library";

type LibrarySearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    pricing?: string;
    platform?: string;
    api?: string;
    verification?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function LibrarySearchPage({ searchParams }: LibrarySearchPageProps) {
  const params = await searchParams;
  const result = getLibrarySearchResults({
    query: params.q,
    category: params.category,
    subcategory: params.subcategory,
    pricing: params.pricing,
    platform: params.platform,
    api: params.api,
    verification: params.verification,
    sort: params.sort,
    page: params.page,
    limit: 24
  });

  return (
    <main className="bg-canvas">
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <nav className="type-label-md text-neutral-500">
          <Link className="hover:text-violet-600" href="/">
            Home
          </Link>{" "}
          /{" "}
          <Link className="hover:text-violet-600" href="/plutos-library">
            Discover
          </Link>{" "}
          / Search
        </nav>
        <Badge className="mt-6" tone="violet">Discover search</Badge>
        <h1 className="mt-4 type-h1 text-neutral-900">
          Search AI tools
        </h1>
        <p className="mt-4 max-w-2xl type-body-lg text-neutral-700">
          Search by tool name, description, category, subcategory, features,
          best-for use cases, audience, platform and API availability.
        </p>
        <LibrarySearch
          categories={plutosLibrary.categories}
          initial={{
            q: params.q,
            category: params.category,
            verification: params.verification
          }}
        />
      </section>
      <SearchResults result={result} />
    </main>
  );
}

