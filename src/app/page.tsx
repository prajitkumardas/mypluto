import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  ExternalLink,
  Filter,
  Library,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecentlyViewed } from "@/components/tools/recently-viewed";
import {
  categories,
  collections,
  comparisonTools,
  librarySteps,
  trendingTools
} from "@/lib/data";
import { cn } from "@/lib/utils";

const chips = [
  "Create cinematic product videos",
  "Design a professional logo",
  "Summarize research papers",
  "Build an app without coding",
  "Automate customer support"
];

export default function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <LibraryPreview />
      <Trending />
      <Collections />
      <ComparePreview />
      <RecentlyViewed />
      <SubmitCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div className="orbit-grid absolute inset-0 opacity-75" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-canvas to-transparent" />
      <div className="relative mx-auto grid min-h-[calc(100svh-80px)] max-w-site content-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-20 xl:px-0">
        <div className="max-w-3xl">
          <Badge className="border border-white/10 bg-white/8 text-white" tone="neutral">
            The intelligent AI-tool universe
          </Badge>
          <h1 className="mt-6 max-w-3xl font-heading text-5xl font-bold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Find the right AI tool for anything.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            Describe what you want to accomplish. Pluto will find, compare and
            explain the best tools for your needs.
          </p>

          <div className="mt-8 max-w-3xl rounded-[2rem] border border-white/14 bg-white p-3 shadow-overlay">
            <label className="flex min-h-16 items-center gap-3 rounded-3xl bg-neutral-50 px-4 text-neutral-900">
              <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-violet-600" />
              <span className="sr-only">Describe your goal</span>
              <input
                className="w-full bg-transparent text-base outline-none placeholder:text-neutral-500 sm:text-lg"
                placeholder="What are you trying to create, solve or automate?"
              />
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:flex-1" size="lg">
                <Link href="/search?q=Create%20product%20videos">
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                  Find my tools
                </Link>
              </Button>
              <Button asChild className="sm:flex-1" size="lg" variant="secondary">
                <Link href="/categories">
                  <Compass aria-hidden="true" className="h-5 w-5" />
                  Browse categories
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Link
                className="focus-ring min-h-10 rounded-lg border border-white/14 bg-white/8 px-3 text-sm font-medium text-white/78 transition hover:border-lime-400 hover:text-lime-400"
                href={`/search?q=${encodeURIComponent(chip)}`}
                key={chip}
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>

        <div aria-label="Orbital tool map" className="relative min-h-[420px] lg:min-h-[560px]">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/14 sm:h-96 sm:w-96" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-400/40 sm:h-72 sm:w-72" />
          <div className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 text-center text-ink-950 shadow-overlay">
            <div>
              <Sparkles aria-hidden="true" className="mx-auto h-7 w-7" />
              <p className="mt-2 font-heading text-xl font-bold">Pluto</p>
            </div>
          </div>
          <OrbitalNode className="left-[5%] top-[16%]" label="Video" tone="bg-coral" />
          <OrbitalNode className="right-[8%] top-[18%]" label="Code" tone="bg-violet-600" />
          <OrbitalNode className="bottom-[18%] left-[10%]" label="Research" tone="bg-[#55E6D4]" />
          <OrbitalNode className="bottom-[12%] right-[16%]" label="Workflow" tone="bg-lime-400" />
          <div className="absolute right-[18%] top-[45%] rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
            <Badge icon tone="success">
              Verified
            </Badge>
            <p className="mt-3 max-w-48 text-sm leading-6 text-white/78">
              Recommendations show why each tool fits and where it falls short.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrbitalNode({
  label,
  tone,
  className
}: {
  label: string;
  tone: string;
  className: string;
}) {
  return (
    <div
      className={cn(
        "absolute flex min-h-16 items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 backdrop-blur",
        className
      )}
    >
      <span className={cn("h-9 w-9 rounded-xl", tone)} />
      <span className="text-sm font-semibold text-white">{label}</span>
    </div>
  );
}

function Categories() {
  return (
    <section className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:py-28 xl:px-0" id="categories">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Badge tone="violet">Popular categories</Badge>
          <h2 className="mt-4 font-heading text-4xl font-bold text-neutral-900 sm:text-5xl">
            Browse by the job you need done.
          </h2>
        </div>
        <Button asChild variant="secondary">
          <Link href="/categories">
            View all categories <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            className={cn(
              "group rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated",
              category.size === "large" && "lg:col-span-2 lg:row-span-2",
              category.size === "medium" && "lg:col-span-1 lg:min-h-64",
              category.size === "compact" && "min-h-44"
            )}
            href={`/categories/${category.slug}`}
            key={category.name}
          >
            <div className="flex items-start justify-between gap-4">
              <span className={cn("grid h-14 w-14 place-items-center rounded-2xl", category.tone)}>
                <category.icon aria-hidden="true" className="h-7 w-7 text-ink-950" />
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-5 w-5 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-violet-600"
              />
            </div>
            <div className={cn(category.size === "large" ? "mt-24" : "mt-10")}>
              <p className="font-heading text-2xl font-bold text-neutral-900">
                {category.name}
              </p>
              <p className="number mt-2 text-sm font-medium text-neutral-500">
                {category.count} verified tools
              </p>
              <p className="mt-4 text-sm leading-6 text-neutral-700">
                {category.examples.join(" / ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LibraryPreview() {
  return (
    <section className="bg-ink-950 py-20 text-white lg:py-28" id="library">
      <div className="mx-auto max-w-site px-5 sm:px-8 xl:px-0">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge className="bg-white/8 text-lime-400" tone="neutral">
              Pluto&apos;s Library
            </Badge>
            <h2 className="mt-4 font-heading text-4xl font-bold sm:text-5xl">
              Not sure where to start? Ask Pluto.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              A guided recommendation flow turns ambiguous goals into matched
              tools, clear tradeoffs and decision-ready explanations.
            </p>
            <Button asChild className="mt-7" variant="lime">
              <Link href="/pluto/ask">
                Start a recommendation <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {librarySteps.map((step, index) => (
              <div
                className="rounded-2xl border border-white/12 bg-white/8 p-5"
                key={step.title}
              >
                <div className="flex gap-4">
                  <span className="number grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lime-400 font-bold text-ink-950">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-heading text-xl font-bold">
                      <step.icon aria-hidden="true" className="h-5 w-5 text-lime-400" />
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/68">{step.copy}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-lime-400/30 bg-lime-400 p-5 text-ink-950">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-heading text-2xl font-bold">Top match: Gamma</p>
                  <p className="mt-2 text-sm leading-6">
                    Matches fast presentation creation, beginner workflow and a
                    freemium budget. Limitation: less control over custom systems.
                  </p>
                </div>
                <Badge className="bg-white text-ink-950" icon tone="neutral">
                  Verified Aug 2026
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trending() {
  return (
    <section className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:py-28 xl:px-0" id="trending">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Badge tone="lime">Trending tools</Badge>
          <h2 className="mt-4 font-heading text-4xl font-bold text-neutral-900 sm:text-5xl">
            What builders are checking now.
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["Today", "This week", "This month"].map((item, index) => (
            <button
              className={cn(
                "focus-ring min-h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold",
                index === 1
                  ? "border-violet-600 bg-violet-100 text-violet-600"
                  : "border-neutral-200 bg-white text-neutral-700"
              )}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card">
        {trendingTools.map((tool) => (
          <article
            className="grid gap-4 border-b border-neutral-200 p-5 last:border-b-0 lg:grid-cols-[72px_1.1fr_1fr_120px_120px_140px] lg:items-center"
            key={tool.name}
          >
            <div className="number font-heading text-3xl font-bold text-neutral-300">
              {String(tool.rank).padStart(2, "0")}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl font-heading text-lg font-bold text-ink-950"
                style={{ backgroundColor: tool.accent }}
              >
                {tool.name.charAt(0)}
              </span>
              <div>
                <h3 className="font-heading text-xl font-bold text-neutral-900">
                  {tool.name}
                </h3>
                <p className="text-sm text-neutral-500">{tool.category}</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-neutral-700">{tool.tagline}</p>
            <Badge tone="neutral">{tool.pricing}</Badge>
            <Badge className="justify-center" tone="success">
              <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
              {tool.movement}
            </Badge>
            <Button asChild variant="secondary">
              <Link href={`/tools/${tool.slug}`}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Evaluate
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Collections() {
  return (
    <section className="bg-neutral-50 py-20 lg:py-28">
      <div className="mx-auto max-w-site px-5 sm:px-8 xl:px-0">
        <div className="max-w-3xl">
          <Badge tone="violet">Curated collections</Badge>
          <h2 className="mt-4 font-heading text-4xl font-bold text-neutral-900 sm:text-5xl">
            Editorial paths through the tool universe.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection, index) => (
            <Link
              className="group flex min-h-72 flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated"
              href={`/collections/${collection.slug}`}
              key={collection.slug}
            >
              <div className="flex justify-between">
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-2xl",
                    ["bg-coral", "bg-lime-400", "bg-sky", "bg-lavender"][index]
                  )}
                >
                  <Library aria-hidden="true" className="h-7 w-7 text-ink-950" />
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-violet-600"
                />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-neutral-900">
                  {collection.name}
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparePreview() {
  return (
    <section className="mx-auto max-w-site px-5 py-20 sm:px-8 lg:py-28 xl:px-0" id="compare">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <Badge tone="info">Compare preview</Badge>
          <h2 className="mt-4 font-heading text-4xl font-bold text-neutral-900 sm:text-5xl">
            Calm decisions, not noisy scoreboards.
          </h2>
          <p className="mt-5 text-base leading-7 text-neutral-700">
            Pluto highlights differences and context instead of declaring a
            universal winner. Start with two to four tools, then filter by what
            matters.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="success">
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
              Best for beginners
            </Badge>
            <Badge tone="lime">
              <CircleDollarSign aria-hidden="true" className="h-3.5 w-3.5" />
              Free plan first
            </Badge>
            <Badge tone="violet">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              Verified data
            </Badge>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-elevated">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2">
              <Filter aria-hidden="true" className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold text-neutral-900">Differences only</span>
            </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/compare">
              Full comparison
            </Link>
          </Button>
          </div>
          <div className="grid min-w-[680px] grid-cols-3">
            {comparisonTools.map((tool) => (
              <div className="border-r border-neutral-200 p-5 last:border-r-0" key={tool.name}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 font-heading font-bold text-violet-600">
                  {tool.logo}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold text-neutral-900">
                  {tool.name}
                </h3>
                <dl className="mt-5 grid gap-4 text-sm">
                  <CompareFact label="Starting price" value={tool.price} />
                  <CompareFact label="Best for" value={tool.bestFor} />
                  <CompareFact label="API" value={tool.api} />
                  <CompareFact label="Team use" value={tool.team} />
                  <CompareFact label="Limitation" value={tool.limitation} />
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-neutral-500">{label}</dt>
      <dd className="mt-1 font-medium leading-5 text-neutral-900">{value}</dd>
    </div>
  );
}

function SubmitCta() {
  return (
    <section className="mx-auto max-w-site px-5 pb-20 sm:px-8 lg:pb-28 xl:px-0">
      <div className="grid gap-8 rounded-[2rem] bg-lime-400 p-6 text-ink-950 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <Badge className="bg-white text-ink-950" tone="neutral">
            Submit a Tool
          </Badge>
          <h2 className="mt-4 font-heading text-4xl font-bold">
            Built something useful? Add it to the universe.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7">
            A guided submission flow will capture product details, pricing,
            platform support and verification notes without one long form.
          </p>
        </div>
        <Button asChild className="bg-ink-950 text-white hover:bg-ink-900" size="lg">
          <Link href="/submit-tool">
            Start submission <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
