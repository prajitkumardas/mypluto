"use client";

import { useMemo, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LibraryToolCard } from "@/components/library/library-tool-card";
import type { LibraryTool } from "@/lib/plutos-library";
import { cn } from "@/lib/utils";

type TrendingToolsProps = {
  toolsByRange: Record<string, LibraryTool[]>;
};

const ranges = [
  ["today", "Today"],
  ["week", "This Week"],
  ["month", "This Month"],
  ["all", "All Time"]
] as const;

export function TrendingTools({ toolsByRange }: TrendingToolsProps) {
  const [range, setRange] = useState<(typeof ranges)[number][0]>("today");
  const tools = useMemo(() => toolsByRange[range] ?? [], [range, toolsByRange]);

  return (
    <section className="mx-auto max-w-site px-5 pb-16 sm:px-8 xl:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge tone="lime">
            <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
            Trending
          </Badge>
          <h2 className="mt-3 font-heading text-4xl font-bold text-neutral-900">
            Recently added tools
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">
            Live event rankings will take over after Supabase analytics has enough activity.
          </p>
        </div>
        <div className="flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-card" role="tablist" aria-label="Trending range">
          {ranges.map(([value, label]) => (
            <button
              aria-selected={range === value}
              className={cn(
                "focus-ring min-h-11 rounded-xl px-3 text-sm font-semibold transition",
                range === value ? "bg-violet-600 text-white" : "text-neutral-700 hover:bg-neutral-100"
              )}
              key={value}
              onClick={() => setRange(value)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tools.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tools.slice(0, 4).map((tool) => (
            <LibraryToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 text-sm font-semibold text-neutral-600">
          No activity is available for this range yet. <ArrowRight aria-hidden="true" className="inline h-4 w-4" />
        </div>
      )}
    </section>
  );
}
