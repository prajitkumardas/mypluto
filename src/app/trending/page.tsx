import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trendingTools } from "@/lib/data";

export default function TrendingPage() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="lime">Trending</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        Meaningful attention, not fabricated popularity.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Trending uses platform signals such as search growth, tool-page views,
        comparison activity, outbound clicks and recent update interest.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {["Today", "This week", "This month", "Video", "New releases", "Recently updated"].map((item, index) => (
          <button
            className={`focus-ring min-h-11 rounded-xl border px-4 text-sm font-semibold ${
              index === 1 ? "border-violet-600 bg-violet-100 text-violet-600" : "border-neutral-200 bg-white"
            }`}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card">
        {trendingTools.map((tool) => (
          <article
            className="grid gap-4 border-b border-neutral-200 p-5 last:border-b-0 lg:grid-cols-[72px_1fr_1fr_140px_140px] lg:items-center"
            key={tool.slug}
          >
            <div className="number font-heading text-3xl font-bold text-neutral-300">
              {String(tool.rank).padStart(2, "0")}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-neutral-900">{tool.name}</h2>
              <p className="text-sm text-neutral-500">{tool.category} / {tool.pricing}</p>
            </div>
            <p className="text-sm leading-6 text-neutral-700">{tool.trendingReason}</p>
            <Badge tone="success">
              <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
              {tool.movement}
            </Badge>
            <Button asChild variant="secondary">
              <Link href={`/tools/${tool.slug}`}>
                Open tool <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
