"use client";

import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tools } from "@/lib/data";
import { useCompareStore } from "@/lib/compare-store";

export function RecentlyViewed() {
  const recentSlugs = useCompareStore((state) => state.recentlyViewed);
  const recentTools = recentSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean)
    .slice(0, 4);

  if (recentTools.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-site px-5 py-16 sm:px-8 xl:px-0">
      <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge tone="lime">Saved on this device</Badge>
            <h2 className="mt-3 flex items-center gap-2 font-heading text-2xl font-bold text-neutral-900">
              <Clock3 aria-hidden="true" className="h-5 w-5 text-violet-600" />
              Recently viewed
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-neutral-600">
            Local history stays in this browser only. It helps returning users continue
            evaluation without an account.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {recentTools.map((tool) =>
            tool ? (
              <Link
                className="focus-ring flex min-h-16 items-center justify-between rounded-2xl border border-neutral-200 px-4 transition hover:border-violet-500"
                href={`/tools/${tool.slug}`}
                key={tool.slug}
              >
                <span className="font-semibold text-neutral-900">{tool.name}</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-neutral-500" />
              </Link>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
