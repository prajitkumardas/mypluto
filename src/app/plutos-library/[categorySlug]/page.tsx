import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CategoryDiscoverFilters } from "@/components/library/category-discover-filters";
import { CategoryNavigation } from "@/components/library/category-navigation";
import { SearchResults } from "@/components/library/search-results";
import {
  getLibraryCategory,
  getLibrarySearchResults,
  getPlatformOptions,
  plutosLibrary
} from "@/lib/plutos-library";
import styles from "./page.module.css";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{
    q?: string;
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

  const result = getLibrarySearchResults({
    query: query.q,
    category: category.slug,
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
      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <CategoryNavigation categories={plutosLibrary.categories} currentCategorySlug={category.slug} />
        <div className="min-w-0">
          <section className={styles.heroShell}>
            <div className={styles.heroInner}>
              <nav className={`${styles.breadcrumb} type-label-md`}>
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/plutos-library">Discover</Link>
                <span>/</span>
                <span>{category.name}</span>
              </nav>

              <div className={styles.heroContent}>
                <Badge className={styles.categoryBadge} tone="violet">
                  {category.name}
                </Badge>
                <h1 className={styles.heroTitle}>
                  Find the right{" "}
                  <span className="type-accent-serif">{formatHeroAccent(category.name)} tool</span>
                </h1>
                <p className={styles.heroCopy}>{category.description}</p>
              </div>

              <CategoryDiscoverFilters
                key={[query.q, query.pricing, query.verification, query.platform, query.api, query.sort].join("-")}
                basePath="/plutos-library"
                categories={plutosLibrary.categories}
                initial={{
                  q: query.q,
                  pricing: query.pricing,
                  verification: query.verification,
                  platform: query.platform,
                  api: query.api,
                  sort: query.sort
                }}
                platforms={getPlatformOptions().slice(0, 18)}
              />
            </div>
          </section>

          <SearchResults result={result} basePath={`/plutos-library/${category.slug}`} />
        </div>
      </div>
    </main>
  );
}

function formatHeroAccent(categoryName: string) {
  const withoutSuffix = categoryName.replace(/\s*&\s*Content$/i, "").replace(/\s+Tools$/i, "");

  if (withoutSuffix.toLowerCase().startsWith("ai ")) {
    return `AI ${withoutSuffix.slice(3).toLowerCase()}`;
  }

  return withoutSuffix.toLowerCase();
}