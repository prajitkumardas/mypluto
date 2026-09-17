import type { Metadata } from "next";
import { HeroVeil } from "@/components/shared/hero-veil";
import { TrendingLeaderboard } from "@/components/trending/trending-leaderboard";
import { getTrendingResponse } from "@/lib/trending";
import styles from "@/components/trending/trending.module.css";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Trending AI Tools | Pluto Finds", description: "Explore AI tools gaining momentum across research, development, design, productivity and creative workflows.", path: "/trending" });

type TrendingPageProps = {
  searchParams: Promise<{
    period?: string;
    category?: string;
  }>;
};

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams;
  const initialResponse = await getTrendingResponse({
    period: params.period,
    category: params.category,
    limit: 20
  });

  return (
    <main className={styles.page}>
      <HeroVeil className={styles.background} />
      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="trending-title">
          <p className={styles.eyebrow}>Trending now</p>
          <h1 className={styles.title} id="trending-title">See what the AI world is using right now.</h1>
          <p className={styles.copy}>
            Real momentum, measured through discovery, comparisons and community interest.
          </p>
          <p className={styles.trustNote}>
            <span className={styles.trustDot} aria-hidden="true" />
            <span>Updated daily</span>
            <span aria-hidden="true">&mdash;</span>
            <span>Based on real platform signals</span>
          </p>
        </section>

        <TrendingLeaderboard initialResponse={initialResponse} />
      </div>
    </main>
  );
}
