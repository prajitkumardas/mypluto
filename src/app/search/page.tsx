import type { Metadata } from "next";
import { HeroSearch } from "@/components/home/hero-search";
import heroStyles from "@/components/home/pluto-hero.module.css";
import { AnimatedHeroBackground } from "@/components/shared/animated-hero-background";
import styles from "./page.module.css";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Search AI Tools | Pluto Finds", description: "Search Pluto Finds' directory and continue to matching AI tools in Discover.", path: "/search" });

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <main className={styles.page} id="main-content">
      <section aria-labelledby="search-page-title" className={styles.hero}>
        <AnimatedHeroBackground />
        <div aria-hidden="true" className={styles.heroVeil} />
        <div className={styles.heroContent}>
          <p className={heroStyles.searchGreeting}>Hey buddy, great to have you here!</p>
          <h1 className={heroStyles.searchTitle} id="search-page-title">
            Let&apos;s Find your perfect AI tool.
          </h1>
          <div className={heroStyles.searchShell}>
            <HeroSearch
              autoFocus
              initialQuery={params.q}
              key={params.q ?? "empty"}
              resultsPath="/plutos-library"
              submitToResultsPage
            />
          </div>
        </div>
      </section>
    </main>
  );
}
