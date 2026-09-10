import Link from "next/link";
import { HeroVeil } from "@/components/shared/hero-veil";
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

type PlutosLibraryPageProps = {
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

export default async function PlutosLibraryPage({ searchParams }: PlutosLibraryPageProps) {
  const params = await searchParams;
  const category = getLibraryCategory(params.category ?? "");
  const result = getLibrarySearchResults({
    query: params.q,
    category: category?.slug,
    pricing: params.pricing,
    platform: params.platform,
    api: params.api,
    verification: params.verification,
    sort: params.sort,
    page: params.page,
    limit: 24
  });

  return (
    <main className={styles.discoverPage}>
      <HeroVeil className={styles.discoverBackground} />
      <div className={styles.discoverContent}>
        <section className={styles.heroShell}>
          <div className={styles.heroInner}>
            <nav className={`${styles.breadcrumb} type-label-md`} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent} aria-current="page">Discover</span>
              {category ? (
                <>
                  <span className={styles.breadcrumbSeparator}>/</span>
                  <span>{category.name}</span>
                </>
              ) : null}
            </nav>

            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Find the right <span className="type-accent-serif">{category ? `${formatHeroAccent(category.name)} tool` : "AI tool"}</span>
              </h1>
              <p className={styles.heroCopy}>
                {category
                  ? `Explore trusted tools for ${formatCategoryPurpose(category.name)}.`
                  : "Search trusted AI tools across every category, then narrow the list with filters."}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.resultsShell}>
          <div className={styles.resultsLayout}>
            <CategoryNavigation
              categories={plutosLibrary.categories}
              currentCategorySlug={category?.slug ?? ""}
              variant="section"
            />
            <div className={styles.catalogueMain}>
              <CategoryDiscoverFilters
                key={[
                  params.q,
                  category?.slug,
                  params.pricing,
                  params.verification,
                  params.platform,
                  params.api,
                  params.sort
                ].join("-")}
                basePath="/plutos-library"
                categories={plutosLibrary.categories}
                initial={{
                  q: params.q,
                  category: category?.slug,
                  pricing: params.pricing,
                  verification: params.verification,
                  platform: params.platform,
                  api: params.api,
                  sort: params.sort
                }}
                placement="catalogue"
                platforms={getPlatformOptions().slice(0, 18)}
              />
              <SearchResults compact embedded result={result} basePath="/plutos-library" />
            </div>
          </div>
        </section>
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

function formatCategoryPurpose(categoryName: string) {
  const normalized = categoryName.replace(/^AI\s+/i, "").toLowerCase();

  if (normalized.includes("writing")) {
    return "copywriting, blogs, SEO, storytelling, and more";
  }

  return `${normalized} workflows, use cases, platforms, pricing, and capability`;
}


