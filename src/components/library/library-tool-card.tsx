"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LibraryTool } from "@/lib/plutos-library";
import { useCompareStore } from "@/lib/compare-store";
import { LibraryBadge } from "./library-badge";

export function LibraryToolCard({ tool }: { tool: LibraryTool }) {
  const selected = useCompareStore((state) => state.selected);
  const addTool = useCompareStore((state) => state.addTool);
  const isSelected = selected.includes(tool.slug);
  const atLimit = selected.length >= 4 && !isSelected;
  const detailHref = `/plutos-library/tool/${tool.slug}`;

  const track = (eventType: string) => {
    void fetch("/api/plutos-library/events", {
      body: JSON.stringify({ eventType, toolSlug: tool.slug }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }).catch(() => undefined);
  };

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <Link className="focus-ring flex items-center gap-3 rounded-xl" href={detailHref} onClick={() => track("tool_view")}>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 type-h6 text-violet-600">
            {tool.name.charAt(0)}
          </span>
          <span>
            <span className="block type-h5 text-neutral-900">
              {tool.name}
            </span>
            <span className="type-body-sm text-neutral-500">
              {tool.categories[0] ?? "Uncategorized"}
            </span>
          </span>
        </Link>
        <LibraryBadge status={tool.verification.status} />
      </div>

      <p className="mt-5 line-clamp-3 type-body-sm text-neutral-700">
        {tool.shortDescription}
      </p>

      <div className="mt-4 grid gap-2 type-label-sm text-neutral-600">
        <span>Pricing: {tool.pricing.model}</span>
        <span>Free plan: {tool.pricing.freePlan}</span>
        <span>API: {tool.api.normalized}</span>
        <span>Platforms: {tool.platforms.slice(0, 3).join(", ") || "Information not available"}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tool.subcategories.slice(0, 2).map((subcategory) => (
          <span className="rounded-lg bg-neutral-100 px-2.5 py-1 type-label-sm text-neutral-700" key={subcategory}>
            {subcategory}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <p className="mb-3 type-label-sm text-neutral-500">
          No ratings or trust scores are shown without a reliable source.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="secondary">
            <Link href={detailHref} onClick={() => track("tool_view")}>
              View details <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            disabled={atLimit}
            onClick={() => {
              addTool(tool.slug);
              track("compare");
            }}
            variant={isSelected ? "lime" : "primary"}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {isSelected ? "Added" : atLimit ? "Limit 4" : "Compare"}
          </Button>
        </div>
        <Button className="mt-2 w-full" onClick={() => track("bookmark")} variant="secondary">
          <Bookmark aria-hidden="true" className="h-4 w-4" />
          Save
        </Button>
        <Button asChild className="mt-2 w-full" variant="ghost">
          <a href={tool.officialUrl || tool.originalOfficialUrl} onClick={() => track("website_click")} rel="noreferrer" target="_blank">
            Visit official site <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
}
