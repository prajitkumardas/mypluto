"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Plus, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/shared/state-panel";
import { tools } from "@/lib/data";
import { plutosLibrary } from "@/lib/plutos-library";
import { useCompareStore } from "@/lib/compare-store";

type CompareTool = {
  slug: string;
  name: string;
  category: string;
  bestFor: string;
  startingPrice: string;
  freePlan: boolean | string;
  api: string;
  skillLevel: string;
  verified: string;
  accent: string;
};

const compareTools: CompareTool[] = [
  ...tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    category: tool.category,
    bestFor: tool.bestFor,
    startingPrice: tool.startingPrice,
    freePlan: tool.freePlan,
    api: tool.api,
    skillLevel: tool.skillLevel,
    verified: tool.verified,
    accent: tool.accent
  })),
  ...plutosLibrary.tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    category: tool.categories[0] ?? "Uncategorized",
    bestFor: tool.useCases[0] ?? "Imported workbook use case",
    startingPrice: tool.pricing.startingPriceRaw,
    freePlan: tool.pricing.freePlan,
    api: tool.api.normalized,
    skillLevel: "Information not available",
    verified: tool.verification.status,
    accent: "#EAE6FF"
  }))
];

const rows = [
  ["Best for", "bestFor"],
  ["Pricing", "startingPrice"],
  ["Free plan", "freePlan"],
  ["API", "api"],
  ["Skill level", "skillLevel"],
  ["Verification", "verified"]
] as const;

export function CompareExperience() {
  const selectedSlugs = useCompareStore((state) => state.selected);
  const removeTool = useCompareStore((state) => state.removeTool);
  const clearCompare = useCompareStore((state) => state.clearCompare);
  const addTool = useCompareStore((state) => state.addTool);
  const selectedTools = selectedSlugs
    .map((slug) => compareTools.find((tool) => tool.slug === slug))
    .filter(Boolean);
  const recommended = compareTools.filter((tool) => !selectedSlugs.includes(tool.slug)).slice(0, 4);

  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="info">Saved on this device</Badge>
      <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="type-h1 text-neutral-900">
            Compare tools without forcing a fake winner.
          </h1>
          <p className="mt-4 max-w-2xl type-body-lg text-neutral-700">
            Compare two to four tools. Pluto highlights contextual strengths so
            the decision matches the requirement.
          </p>
        </div>
        {selectedTools.length > 0 ? (
          <Button onClick={clearCompare} variant="secondary">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Clear comparison
          </Button>
        ) : null}
      </div>

      {selectedTools.length === 0 ? (
        <div className="mt-10">
          <StatePanel
            action="Search for tools"
            copy="Add two or more tools to compare. You can start from search, recently viewed tools, popular comparisons or Pluto recommendations."
            secondary="Ask Pluto"
            title="No tools selected"
          />
          <RecommendedTools tools={recommended} addTool={addTool} />
        </div>
      ) : null}

      {selectedTools.length === 1 ? (
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
            <Badge tone="violet">One selected tool</Badge>
            <h2 className="mt-4 type-h3 text-neutral-900">
              Add another tool to unlock comparison.
            </h2>
            <p className="mt-3 type-body-sm text-neutral-700">
              Your current choice is preserved locally. Recommended comparable
              tools are shown on the right.
            </p>
          </div>
          <RecommendedTools tools={recommended} addTool={addTool} />
        </section>
      ) : null}

      {selectedTools.length >= 2 ? (
        <section className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-elevated">
          <div className="flex flex-col gap-3 border-b border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge tone="violet">Highlight differences</Badge>
              <Badge tone="neutral">Show all information</Badge>
              {selectedTools.length === 4 ? (
                <Badge tone="lime">Maximum comparison limit</Badge>
              ) : null}
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/tools">
                Add tool <Plus aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[760px]"
              style={{ gridTemplateColumns: `180px repeat(${selectedTools.length}, minmax(190px, 1fr))` }}
            >
              <div className="border-b border-r border-neutral-200 p-4 type-label-md text-neutral-500">
                Attribute
              </div>
              {selectedTools.map((tool) =>
                tool ? (
                  <div className="border-b border-r border-neutral-200 p-4 last:border-r-0" key={tool.slug}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className="grid h-11 w-11 place-items-center rounded-xl type-h6 text-ink-950"
                          style={{ backgroundColor: tool.accent }}
                        >
                          {tool.name.charAt(0)}
                        </span>
                        <h2 className="mt-3 type-h5 text-neutral-900">
                          {tool.name}
                        </h2>
                        <p className="type-body-sm text-neutral-500">{tool.category}</p>
                      </div>
                      <button
                        aria-label={`Remove ${tool.name}`}
                        className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100"
                        onClick={() => removeTool(tool.slug)}
                      >
                        <X aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null
              )}
              {rows.map(([label, key]) => (
                <ComparisonRow key={label} label={label} field={key} selectedTools={selectedTools} />
              ))}
            </div>
          </div>
          <div className="grid gap-4 border-t border-neutral-200 p-5 md:grid-cols-4">
            {["Best for beginners", "Best free option", "Best for API integration", "Best for teams"].map(
              (label) => (
                <div className="rounded-2xl bg-lime-100 p-4 type-label-md text-ink-950" key={label}>
                  <CheckCircle2 aria-hidden="true" className="mb-2 h-5 w-5" />
                  {label}
                </div>
              )
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function ComparisonRow({
  label,
  field,
  selectedTools
}: {
  label: string;
  field: (typeof rows)[number][1];
  selectedTools: Array<CompareTool | undefined>;
}) {
  return (
    <>
      <div className="border-b border-r border-neutral-200 bg-neutral-50 p-4 type-label-md text-neutral-700">
        {label}
      </div>
      {selectedTools.map((tool) => (
        <div className="border-b border-r border-neutral-200 p-4 type-body-sm text-neutral-800 last:border-r-0" key={`${tool?.slug}-${field}`}>
          {tool ? formatValue(tool[field]) : null}
        </div>
      ))}
    </>
  );
}

function formatValue(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return value;
}

function RecommendedTools({
  tools: recommendedTools,
  addTool
}: {
  tools: CompareTool[];
  addTool: (slug: string) => void;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
      <h2 className="type-h4 text-neutral-900">
        Recommended comparable tools
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {recommendedTools.map((tool) => (
          <button
            className="focus-ring min-h-32 rounded-2xl border border-neutral-200 p-4 text-left transition hover:border-violet-500"
            key={tool.slug}
            onClick={() => addTool(tool.slug)}
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-xl type-h6 text-ink-950"
              style={{ backgroundColor: tool.accent }}
            >
              {tool.name.charAt(0)}
            </span>
            <span className="mt-3 block type-h6 text-neutral-900">
              {tool.name}
            </span>
            <span className="mt-1 block type-body-sm text-neutral-500">{tool.bestFor}</span>
          </button>
        ))}
      </div>
      <Button asChild className="mt-5" variant="secondary">
        <Link href="/tools">
          Browse all tools <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
