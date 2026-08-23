import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchResults } from "@/components/library/search-results";
import {
  buildLibraryHref,
  getCategoryToolCount,
  getLibraryCategory,
  getLibrarySearchResults,
  getLibrarySubcategories,
  getPlatformOptions,
  plutosLibrary
} from "@/lib/plutos-library";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{
    q?: string;
    subcategory?: string;
    pricing?: string;
    platform?: string;
    api?: string;
    verification?: string;
    sort?: string;
    page?: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return plutosLibrary.categories.map((category) => ({ categorySlug: category.slug }));
}

export default async function LibraryCategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params;
  const query = await searchParams;
  const category = getLibraryCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const subcategories = getLibrarySubcategories(category.slug);
  const result = getLibrarySearchResults({
    query: query.q,
    category: category.slug,
    subcategory: query.subcategory,
    pricing: query.pricing,
    platform: query.platform,
    api: query.api,
    verification: query.verification,
    sort: query.sort,
    page: query.page,
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
          / {category.name}
        </nav>
        <div className="mt-6 grid gap-8 lg:grid-cols-[0.85fr_0.65fr] lg:items-start">
          <div>
            <Badge tone="violet">{category.name}</Badge>
            <h1 className="mt-4 type-h1 text-neutral-900">
              {category.name} tools
            </h1>
            <p className="mt-4 max-w-2xl type-body-lg text-neutral-700">
              {category.description}
            </p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Metric label="Available tools" value={getCategoryToolCount(category.slug)} />
              <Metric label="Subcategories" value={subcategories.length} />
            </dl>
          </div>
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
            <h2 className="type-h4 text-neutral-900">
              Subcategories
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {subcategories.slice(0, 12).map((subcategory) => (
                <Link
                  className="focus-ring flex min-h-12 items-center justify-between rounded-xl bg-neutral-50 px-3 type-label-md hover:text-violet-600"
                  href={buildLibraryHref(`/plutos-library/${category.slug}`, {
                    ...query,
                    subcategory: subcategory.slug,
                    page: undefined
                  })}
                  key={subcategory.id}
                >
                  {subcategory.name}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <form
          action={`/plutos-library/${category.slug}`}
          className="mt-10 grid gap-3 rounded-3xl border border-neutral-200 bg-white p-3 shadow-card md:grid-cols-2 xl:grid-cols-[1fr_repeat(5,auto)]"
        >
          <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-neutral-50 px-4">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-violet-600" />
            <span className="sr-only">Search within {category.name}</span>
            <input
              className="w-full bg-transparent type-body-md outline-none placeholder:text-neutral-500"
              defaultValue={query.q}
              name="q"
              placeholder={`Search ${category.name}`}
            />
          </label>
          <FilterSelect label="Subcategory" name="subcategory" value={query.subcategory ?? ""}>
            <option value="">All subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.slug}>
                {subcategory.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Pricing" name="pricing" value={query.pricing ?? ""}>
            <option value="">Any pricing</option>
            <option value="free">Free plan</option>
            <option value="paid">Paid</option>
            <option value="unknown">Unknown</option>
          </FilterSelect>
          <FilterSelect label="Verification" name="verification" value={query.verification ?? ""}>
            <option value="">Any verification</option>
            <option value="verified">Verified</option>
            <option value="needs-verification">Needs verification</option>
            <option value="recently-verified">Recently verified</option>
          </FilterSelect>
          <FilterSelect label="Platform" name="platform" value={query.platform ?? ""}>
            <option value="">Any platform</option>
            {getPlatformOptions().slice(0, 18).map((platform) => (
              <option key={platform} value={platform.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}>
                {platform}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="API availability" name="api" value={query.api ?? ""}>
            <option value="">Any API</option>
            <option value="yes">API available</option>
            <option value="no">No API</option>
          </FilterSelect>
          <Button type="submit">
            Apply <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </form>
      </section>

      <SearchResults result={result} basePath={`/plutos-library/${category.slug}`} />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
      <dt className="type-label-md text-neutral-500">{label}</dt>
      <dd className="number mt-1 type-h3 text-neutral-900">
        {value}
      </dd>
    </div>
  );
}

function FilterSelect({
  children,
  label,
  name,
  value
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="grid gap-1 type-label-sm text-neutral-500">
      <span className="sr-only">{label}</span>
      <select
        className="min-h-14 rounded-2xl border border-neutral-200 bg-white px-3 type-label-md text-neutral-900"
        defaultValue={value}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

