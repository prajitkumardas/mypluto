"use client";

import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { CompareButton } from "@/components/compare/compare-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlutoButton } from "@/components/ui/pluto-button";
import type { ToolRecord } from "@/lib/data";
import { useCompareStore } from "@/lib/compare-store";

type ToolCardProps = {
  tool: ToolRecord;
  variant?: "standard" | "compact" | "featured";
};

export function ToolCard({ tool, variant = "standard" }: ToolCardProps) {
  const saved = useCompareStore((state) => state.saved);
  const toggleSaved = useCompareStore((state) => state.toggleSaved);
  const isSaved = saved.includes(tool.slug);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <Link className="focus-ring flex items-center gap-3 rounded-xl" href={`/tools/${tool.slug}`}>
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl type-h6 text-ink-950 transition group-hover:scale-105"
            style={{ backgroundColor: tool.accent }}
          >
            {tool.name.charAt(0)}
          </span>
          <span>
            <span className="block type-h5 text-neutral-900">
              {tool.name}
            </span>
            <span className="type-body-sm text-neutral-500">{tool.category}</span>
          </span>
        </Link>
        <Badge icon tone="success">
          {tool.verification.status}
        </Badge>
      </div>

      <p className="mt-5 type-body-sm text-neutral-700">{tool.tagline}</p>

      {variant !== "compact" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="neutral">{tool.pricing}</Badge>
          <Badge tone="violet">Best for {tool.bestFor.toLowerCase()}</Badge>
          {tool.freePlan ? <Badge tone="lime">Free plan</Badge> : null}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <p className="mb-3 type-label-sm text-neutral-500">
          Saved on this device for compare and shortlist actions.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <PlutoButton fullWidth href={`/tools/${tool.slug}`} showArrow variant="secondary">
            View details
          </PlutoButton>
          <CompareButton toolName={tool.name} toolSlug={tool.slug} variant="primary" />
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