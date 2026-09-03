import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { LibrarySearch } from "@/components/library/library-search";
import { SearchResults } from "@/components/library/search-results";
import { getLibrarySearchResults } from "@/lib/plutos-library";

type LibrarySearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
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
      <PageShell as="section">
        <nav className="type-label-md text-[var(--text-tertiary)]">
          <Link className="hover:text-[var(--color-pluto-purple-300)]" href="/">
            Home
          </Link>{" "}
          /{" "}
          <Link className="hover:text-[var(--color-pluto-purple-300)]" href="/plutos-library">
            Discover
          </Link>{" "}
          / Search
        </nav>
        <PageHeader
          className="mt-6"
          eyebrow="Discover search"
          title="Search AI tools"
          description="Search by tool name, description, category, features, best-for use cases, audience, platform and API availability."
        />
        <LibrarySearch
          initial={{
            q: params.q
          }}
        />
      </PageShell>
      <SearchResults result={result} />
    </main>
  );
}