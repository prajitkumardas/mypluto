"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ToolRecord } from "@/lib/data";
import { useCompareStore } from "@/lib/compare-store";

type ToolCardProps = {
  tool: ToolRecord;
  variant?: "standard" | "compact" | "featured";
};

export function ToolCard({ tool, variant = "standard" }: ToolCardProps) {
  const selected = useCompareStore((state) => state.selected);
  const saved = useCompareStore((state) => state.saved);
  const addTool = useCompareStore((state) => state.addTool);
  const toggleSaved = useCompareStore((state) => state.toggleSaved);
  const isSelected = selected.includes(tool.slug);
  const isSaved = saved.includes(tool.slug);
  const atLimit = selected.length >= 4 && !isSelected;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <Link className="focus-ring flex items-center gap-3 rounded-xl" href={`/tools/${tool.slug}`}>
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-heading text-lg font-bold text-ink-950 transition group-hover:scale-105"
            style={{ backgroundColor: tool.accent }}
          >
            {tool.name.charAt(0)}
          </span>
          <span>
            <span className="block font-heading text-xl font-bold text-neutral-900">
              {tool.name}
            </span>
            <span className="text-sm text-neutral-500">{tool.category}</span>
          </span>
        </Link>
        <Badge icon tone="success">
          {tool.verification.status}
        </Badge>
      </div>

      <p className="mt-5 text-sm leading-6 text-neutral-700">{tool.tagline}</p>

      {variant !== "compact" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="neutral">{tool.pricing}</Badge>
          <Badge tone="violet">Best for {tool.bestFor.toLowerCase()}</Badge>
          {tool.freePlan ? <Badge tone="lime">Free plan</Badge> : null}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <p className="mb-3 text-xs font-semibold text-neutral-500">
          Saved on this device for compare and shortlist actions.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="secondary">
            <Link href={`/tools/${tool.slug}`}>
              View details <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            disabled={atLimit}
            onClick={() => addTool(tool.slug)}
            title={atLimit ? "Remove a tool before adding another" : "Add to compare"}
            variant={isSelected ? "lime" : "primary"}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {isSelected ? "Added" : atLimit ? "Limit 4" : "Compare"}
          </Button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Button onClick={() => toggleSaved(tool.slug)} variant="ghost">
            <Star aria-hidden="true" className="h-4 w-4" />
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button asChild variant="ghost">
            <a href={tool.officialUrl} rel="noreferrer" target="_blank">
              Explore Tool <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
