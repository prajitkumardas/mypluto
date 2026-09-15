"use client";

import * as Select from "@radix-ui/react-select";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CompareButton } from "@/components/compare/compare-button";
import { useGlobalLoading } from "@/components/loading/loading-provider";
import { ToolLogo } from "@/components/shared/tool-logo";
import { TrendIndicator } from "@/components/trending/trend-indicator";
import { PlutoButton } from "@/components/ui/pluto-button";
import { cn } from "@/lib/utils";
import type { TrendingResponse, TrendingTool, TrendPeriod } from "@/lib/trending";
import styles from "./trending.module.css";

const periods: Array<{ value: TrendPeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "new", label: "New releases" },
  { value: "updated", label: "Recently updated" }
];

export function TrendingLeaderboard({ initialResponse }: { initialResponse: TrendingResponse }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [response, setResponse] = useState(initialResponse);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const period = (searchParams.get("period") || "week") as TrendPeriod;
  const category = searchParams.get("category") || "all";
  const isLoading = isPending || response.period !== period || response.category !== category;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ period, limit: "20" });
    if (category !== "all") params.set("category", category);

    fetch(`/api/trending?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Trending request failed");
        return res.json() as Promise<TrendingResponse>;
      })
      .then((nextResponse) => {
        setError("");
        setResponse(nextResponse);
      })
      .catch((requestError: Error) => {
        if (requestError.name === "AbortError") return;
        setError("Trending data could not be refreshed. Showing the latest available list.");
      });

    return () => controller.abort();
  }, [category, period]);

  const updateQuery = (next: { period?: TrendPeriod; category?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", next.period ?? period);
    const nextCategory = next.category ?? category;
    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <section className={styles.board} aria-labelledby="trending-table-title">
      <div className={styles.periods} aria-label="Trending time period">
        {periods.map((item) => (
          <button
            aria-pressed={period === item.value}
            className={styles.periodButton}
            key={item.value}
            onClick={() => updateQuery({ period: item.value })}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <p className={styles.count} id="trending-table-title">{response.tools.length} tools</p>
        <CategorySelect
          categories={response.categories}
          value={category}
          onChange={(value) => updateQuery({ category: value })}
        />
      </div>

      {error ? <p className="mb-3 type-label-md text-rose-200" role="alert">{error}</p> : null}
      <div aria-live="polite" className="sr-only">
        {isLoading ? "Loading trending tools" : `Showing ${response.tools.length} tools for ${period}.`}
      </div>

      <div className={styles.tableWrap} aria-busy={isLoading}>
        {response.tools.length === 0 && !isLoading ? <EmptyState /> : null}
        {response.tools.length > 0 || isLoading ? (
          <>
            <table className={styles.table}>
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
              <tbody>{isLoading ? <SkeletonRows /> : response.tools.map((tool) => <TrendingRow key={tool.slug} period={response.period} tool={tool} />)}</tbody>
            </table>
            <div className={styles.mobileList}>{isLoading ? <MobileSkeletonRows /> : response.tools.map((tool) => <MobileTrendingItem key={tool.slug} period={response.period} tool={tool} />)}</div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function CategorySelect({
  categories,
  onChange,
  value
}: {
  categories: TrendingResponse["categories"];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={cn("pf-select-trigger", styles.selectTrigger)} aria-label="Filter by category">
        <Select.Value placeholder="All categories" />
        <Select.Icon asChild>
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={cn("pf-select-content", styles.selectContent)} position="popper" sideOffset={8}>
          <Select.Viewport className={styles.selectViewport}>
            {categories.map((category) => (
              <Select.Item className={cn("pf-select-item", styles.selectItem)} key={category.value} value={category.value}>
                <Select.ItemText>{category.label}</Select.ItemText>
                <span className="text-white/40">{category.count}</span>
                <Select.ItemIndicator>
                  <Check aria-hidden="true" className="h-4 w-4 text-lime-300" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function TrendingRow({ period, tool }: { period: TrendPeriod; tool: TrendingTool }) {
  const router = useRouter();
  const { startLoading } = useGlobalLoading();
  const href = `/tools/${tool.slug}`;
  const openTool = () => {
    startLoading();
    router.push(href);
  };

  return (
    <tr
      className={styles.row}
      onClick={openTool}
      onKeyDown={(event) => {
        if (event.key === "Enter") openTool();
      }}
      tabIndex={0}
    >
      <td className={cn(styles.rank, tool.currentRank <= 3 && styles.topRank)}>{String(tool.currentRank).padStart(2, "0")}</td>
      <td className={styles.toolCell}>
        <ToolIdentity tool={tool} />
      </td>
      <td><p className={styles.bestFor}>{tool.bestFor}</p></td>
      <td className={styles.price}>{tool.pricingType}</td>
      <td><TrendIndicator period={period} tool={tool} /></td>
      <td>
        <div className={styles.actionGroup}>
          <PlutoButton href={href} onClick={(event) => event.stopPropagation()} showArrow size="sm" variant="secondary">
            View details
          </PlutoButton>
          <CompareButton compact onClick={(event) => event.stopPropagation()} toolName={tool.name} toolSlug={tool.slug} variant="secondary" />
        </div>
      </td>
    </tr>
  );
}

function MobileTrendingItem({ period, tool }: { period: TrendPeriod; tool: TrendingTool }) {
  return (
    <article className={styles.mobileItem}>
      <Link className={styles.mobileMainLink} href={`/tools/${tool.slug}`}>
        <span className={styles.mobileTop}>
          <span className={styles.mobileRank}>{String(tool.currentRank).padStart(2, "0")}</span>
          <ToolIdentity tool={tool} />
          <TrendIndicator period={period} tool={tool} />
        </span>
        <span className={styles.mobileCopy}>{tool.bestFor}</span>
      </Link>
      <CompareButton compact toolName={tool.name} toolSlug={tool.slug} variant="secondary" />
    </article>
  );
}

function ToolIdentity({ tool }: { tool: TrendingTool }) {
  return (
    <span className={styles.toolIdentity}>
      <ToolLogo className={styles.logoTile} imageClassName={styles.logoImage} name={tool.name} src={tool.logoUrl} />
      <span className="min-w-0">
        <span className={styles.toolName}>{tool.name}</span>
        <span className={styles.toolMeta}>{tool.category} - {tool.pricingType}</span>
      </span>
    </span>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <h2>No trending tools found in this category yet.</h2>
      <p>Try another category or check back after the next update.</p>
    </div>
  );
}

function SkeletonRows() {
  return Array.from({ length: 10 }).map((_, index) => (
    <tr className={styles.skeletonRow} key={index}>
      <td><span className={styles.skeletonLine} style={{ width: "2.4rem" }} /></td>
      <td>
        <span className={styles.toolIdentity}>
          <span className={styles.skeletonLogo} />
          <span className="grid flex-1 gap-2">
            <span className={styles.skeletonLine} style={{ width: "8rem" }} />
            <span className={styles.skeletonLine} style={{ width: "11rem" }} />
          </span>
        </span>
      </td>
      <td><span className={styles.skeletonLine} style={{ width: "15rem" }} /></td>
      <td><span className={styles.skeletonLine} style={{ width: "5rem" }} /></td>
      <td><span className={styles.skeletonLine} style={{ width: "4rem" }} /></td>
      <td><span className={styles.skeletonLine} style={{ width: "6rem" }} /></td>
    </tr>
  ));
}

function MobileSkeletonRows() {
  return Array.from({ length: 8 }).map((_, index) => (
    <div className={styles.mobileItem} key={index}>
      <span className={styles.mobileTop}>
        <span className={styles.skeletonLine} style={{ width: "2rem" }} />
        <span className={styles.toolIdentity}>
          <span className={styles.skeletonLogo} />
          <span className="grid flex-1 gap-2">
            <span className={styles.skeletonLine} style={{ width: "7rem" }} />
            <span className={styles.skeletonLine} style={{ width: "10rem" }} />
          </span>
        </span>
        <span className={styles.skeletonLine} style={{ width: "3rem" }} />
      </span>
    </div>
  ));
}
