import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { PlutoButton } from "@/components/ui/pluto-button";
import { StatePanel } from "@/components/shared/state-panel";
import { ToolCard } from "@/components/tools/tool-card";
import { RecentlyViewed } from "@/components/tools/recently-viewed";
import { categories, tools } from "@/lib/data";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "All AI Tools | Pluto Finds", description: "Browse structured AI tool listings by category, feature, use case and profession.", path: "/tools" });

export default function ToolsPage() {
  const activeFilters = ["Verified", "Free plan", "Beginner-friendly"];

  return (
    <main className="bg-canvas">
      <PageShell as="section">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-xs)] lg:sticky lg:top-28">
            <div className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-[var(--color-pluto-purple-300)]" />
              <h2 className="type-h2 text-[var(--text-primary)]">Filters</h2>
            </div>
            <p className="mt-2 type-body-sm text-[var(--text-secondary)]">
              URL-backed filter state will make every result set shareable.
            </p>
            <div className="mt-5 grid gap-5">
              <FilterGroup title="Category" values={categories.map((category) => category.name)} />
              <FilterGroup title="Pricing" values={["Free plan", "Freemium", "Paid", "Open source"]} />
              <FilterGroup title="Decision needs" values={["API available", "Beginner", "Teams", "Commercial usage"]} />
            </div>
            <div className="mt-5 rounded-[var(--radius-lg)] border border-[rgba(200,255,90,0.28)] bg-[rgba(200,255,90,0.1)] p-4 type-body-sm text-[var(--text-brand)]">
              Saved on this device: selected compare tools, saved tools and recently viewed history.
            </div>
          </aside>

          <div>
            <PageHeader
              actions={(
                <PlutoButton href="/pluto-guides" variant="secondary">Pluto Guides</PlutoButton>
              )}
              eyebrow="All AI Tools"
              title="Find tools by requirement, not by list fatigue."
              description="Browse the structured directory, then move into evaluation, comparison or Pluto-assisted recommendations."
            />

            <div className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-3 shadow-[var(--shadow-xs)]">
              <label className="flex min-h-14 items-center gap-3 rounded-[var(--radius-xl)] bg-[var(--background-interactive)] px-4">
                <Search aria-hidden="true" className="h-5 w-5 text-[var(--color-pluto-purple-300)]" />
                <span className="sr-only">Search within tools</span>
                <input
                  className="w-full bg-transparent type-body-md outline-none placeholder:text-[var(--text-tertiary)]"
                  placeholder="Search by tool, feature, use case or profession"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="number type-label-md text-[var(--text-tertiary)]">
                {tools.length} recommended tools shown from mock data
              </p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} tone="neutral">
                    <Filter aria-hidden="true" className="h-3.5 w-3.5" />
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>

            <div className="mt-10">
              <StatePanel
                action="Relax one filter"
                copy="When filters produce no strong matches, preserve the user's choices and offer the closest routes back to discovery."
                secondary="Pluto Guides"
                title="No tools match every requirement"
              />
            </div>
          </div>
        </div>
      </PageShell>
      <RecentlyViewed />
    </main>
  );
}

function FilterGroup({ title, values }: { title: string; values: string[] }) {
  return (
    <fieldset>
      <legend className="type-label-md text-[var(--text-primary)]">{title}</legend>
      <div className="mt-3 grid gap-2">
        {values.map((value, index) => (
          <label
            className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 type-label-md text-[var(--text-secondary)] transition hover:border-[var(--border-brand)] hover:text-[var(--text-primary)]"
            key={value}
          >
            <input className="h-4 w-4 accent-[var(--action-primary)]" defaultChecked={index === 0} type="checkbox" />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
import type { Metadata } from "next";
