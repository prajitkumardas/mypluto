import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/shared/state-panel";
import { ToolCard } from "@/components/tools/tool-card";
import { RecentlyViewed } from "@/components/tools/recently-viewed";
import { categories, tools } from "@/lib/data";

export default function ToolsPage() {
  const activeFilters = ["Verified", "Free plan", "Beginner-friendly"];

  return (
    <main className="bg-canvas">
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-5 shadow-card lg:sticky lg:top-28">
            <div className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-violet-600" />
              <h2 className="font-heading text-2xl font-bold text-neutral-900">Filters</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              URL-backed filter state will make every result set shareable.
            </p>
            <div className="mt-5 grid gap-5">
              <FilterGroup title="Category" values={categories.map((category) => category.name)} />
              <FilterGroup
                title="Pricing"
                values={["Free plan", "Freemium", "Paid", "Open source"]}
              />
              <FilterGroup
                title="Decision needs"
                values={["API available", "Beginner", "Teams", "Commercial usage"]}
              />
            </div>
            <div className="mt-5 rounded-2xl bg-lime-100 p-4 text-sm text-ink-950">
              Saved on this device: selected compare tools, saved tools and recently viewed history.
            </div>
          </aside>

          <div>
            <Badge tone="violet">All AI Tools</Badge>
            <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-heading text-5xl font-bold text-neutral-900">
                  Find tools by requirement, not by list fatigue.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
                  Browse the structured directory, then move into evaluation,
                  comparison or Pluto-assisted recommendations.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/pluto/ask">Ask Pluto</Link>
              </Button>
            </div>

            <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-3 shadow-card">
              <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-neutral-50 px-4">
                <Search aria-hidden="true" className="h-5 w-5 text-violet-600" />
                <span className="sr-only">Search within tools</span>
                <input
                  className="w-full bg-transparent text-base outline-none placeholder:text-neutral-500"
                  placeholder="Search by tool, feature, use case or profession"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="number text-sm font-semibold text-neutral-600">
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
                secondary="Ask Pluto"
                title="No tools match every requirement"
              />
            </div>
          </div>
        </div>
      </section>
      <RecentlyViewed />
    </main>
  );
}

function FilterGroup({ title, values }: { title: string; values: string[] }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-neutral-900">{title}</legend>
      <div className="mt-3 grid gap-2">
        {values.map((value, index) => (
          <label
            className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700"
            key={value}
          >
            <input className="h-4 w-4 accent-violet-600" defaultChecked={index === 0} type="checkbox" />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
