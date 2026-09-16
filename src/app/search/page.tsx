import type { Metadata } from "next";
import { HeroSearch } from "@/components/home/hero-search";
import heroStyles from "@/components/home/pluto-hero.module.css";
import { CategoryDiscoverFilters } from "@/components/library/category-discover-filters";
import { SearchResults } from "@/components/library/search-results";
import { AnimatedHeroBackground } from "@/components/shared/animated-hero-background";
import {
  getLibrarySearchResults,
  getPlatformOptions,
  plutosLibrary
} from "@/lib/plutos-library";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Search AI Tools | Pluto Finds",
  description: "Search and filter Pluto Finds' directory of AI tools."
};

type SearchPageProps = {
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
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
    <main className={styles.page}>
      <section aria-labelledby="search-page-title" className={styles.hero}>
        <AnimatedHeroBackground />
        <div aria-hidden="true" className={styles.heroVeil} />
        <div className={styles.heroContent}>
          <p className={heroStyles.searchGreeting}>Hey buddy, great to have you here!</p>
          <h1 className={heroStyles.searchTitle} id="search-page-title">
            Let&apos;s Find your perfect AI tool.
          </h1>
          <div className={heroStyles.searchShell}>
            <HeroSearch initialQuery={params.q} key={params.q ?? "empty"} resultsPath="/search" />
          </div>
        </div>
      </section>

      <section aria-label="Search filters and results" className={styles.resultsSection}>
        <div className={styles.resultsInner}>
          <CategoryDiscoverFilters
            basePath="/search"
            categories={plutosLibrary.categories}
            initial={{
              q: params.q,
              category: params.category,
              pricing: params.pricing,
              verification: params.verification,
              platform: params.platform,
              api: params.api,
              sort: params.sort
            }}
            placement="catalogue"
            platforms={getPlatformOptions().slice(0, 18)}
          />
          <SearchResults basePath="/search" compact embedded result={result} />
        </div>
      </section>
    </main>
  );
}
