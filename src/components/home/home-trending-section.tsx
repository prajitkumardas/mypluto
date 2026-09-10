"use client";

import { useEffect, useState } from "react";
import { ToolLogo } from "@/components/shared/tool-logo";
import { TrendIndicator } from "@/components/trending/trend-indicator";
import { PlutoButton } from "@/components/ui/pluto-button";
import type { TrendingResponse, TrendingTool, TrendPeriod } from "@/lib/trending";
import styles from "./home-trending-section.module.css";

const periods: Array<{ label: string; value: TrendPeriod }> = [
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" }
];

export function HomeTrendingSection({ initialResponse }: { initialResponse: TrendingResponse }) {
  const [period, setPeriod] = useState<TrendPeriod>(initialResponse.period);
  const [response, setResponse] = useState(initialResponse);
  const [error, setError] = useState("");
  const isLoading = response.period !== period;

  useEffect(() => {
    if (response.period === period) return;

    const controller = new AbortController();
    fetch(`/api/trending?period=${period}&limit=4`, { signal: controller.signal })
      .then((result) => {
        if (!result.ok) throw new Error("Trending request failed");
        return result.json() as Promise<TrendingResponse>;
      })
      .then((nextResponse) => {
        setResponse(nextResponse);
        setError("");
      })
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") {
          setError("Trending data could not be refreshed.");
          setPeriod(response.period);
        }
      });

    return () => controller.abort();
  }, [period, response.period]);

  return (
    <section aria-labelledby="home-trending-title" className={styles.section} id="trending">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Trending tools</p>
            <h1 className={styles.title} id="home-trending-title">
              What builders are <span>checking now.</span>
            </h1>
            <p className={styles.copy}>See which AI tools are gaining attention right now.</p>
          </div>

          <div aria-label="Trending time period" className={styles.periods} role="group">
            {periods.map((item) => (
              <button
                aria-pressed={period === item.value}
                className={styles.periodButton}
                key={item.value}
                onClick={() => setPeriod(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div aria-live="polite" className="sr-only">
          {isLoading ? "Loading trending tools" : `Showing the top ${response.tools.length} tools for ${period}.`}
        </div>

        <div className={styles.board}>
          <table aria-busy={isLoading} className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Tool</th>
                <th scope="col">Best for</th>
                <th scope="col">Pricing</th>
                <th scope="col">Trend</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {response.tools.map((tool) => (
                <tr className={styles.row} key={tool.slug}>
                  <td className={styles.rank}>{String(tool.currentRank).padStart(2, "0")}</td>
                  <td>
                    <ToolIdentity tool={tool} />
                  </td>
                  <td><p className={styles.bestFor}>{tool.bestFor}</p></td>
                  <td><span className={styles.pricing}>{tool.pricingType}</span></td>
                  <td><TrendIndicator period={response.period} tool={tool} /></td>
                  <td>
                    <div className={styles.actions}>
                      <PlutoButton href={`/tools/${tool.slug}`} showArrow size="sm" variant="secondary">
                        View details
                      </PlutoButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div aria-busy={isLoading} className={styles.mobileList}>
            {response.tools.map((tool) => (
              <article className={styles.mobileCard} key={tool.slug}>
                <div className={styles.mobileTopline}>
                  <span className={styles.rank}>{String(tool.currentRank).padStart(2, "0")}</span>
                  <TrendIndicator period={response.period} tool={tool} />
                </div>
                <ToolIdentity tool={tool} />
                <p className={styles.bestFor}>{tool.bestFor}</p>
                <div className={styles.mobileMeta}>
                  <span className={styles.pricing}>{tool.pricingType}</span>
                </div>
                <div className={styles.mobileActions}>
                  <PlutoButton fullWidth href={`/tools/${tool.slug}`} showArrow size="sm" variant="secondary">
                    View details
                  </PlutoButton>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.exploreAll}>
          <PlutoButton href={`/trending?period=${period}`} showArrow size="lg" variant="secondary">
            Explore All
          </PlutoButton>
        </div>
      </div>
    </section>
  );
}

function ToolIdentity({ tool }: { tool: TrendingTool }) {
  return (
    <div className={styles.toolIdentity}>
      <ToolLogo className={styles.logo} name={tool.name} src={tool.logoUrl} />
      <div className={styles.toolCopy}>
        <h3 className={styles.toolName}>{tool.name}</h3>
        <p className={styles.toolMeta}>{tool.category} &middot; {tool.pricingType}</p>
      </div>
    </div>
  );
}
