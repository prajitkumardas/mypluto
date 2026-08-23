import type { CSSProperties } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  Filter,
  Library,
  Plus,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { CategoryBentoEffects } from "@/components/home/category-bento-effects";
import categoryBentoStyles from "@/components/home/category-bento.module.css";
import { PlutoHero } from "@/components/home/pluto-hero";
import { PlutoStorySection } from "@/components/home/pluto-story-section";
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

export default function Home() {
  return (
    <main>
      <PlutoHero />
      <PlutoStorySection />
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

function Categories() {
  return (
    <section className={categoryBentoStyles.section} data-magic-category-section id="categories">
      <CategoryBentoEffects glowColor="124, 99, 255" particleCount={12} spotlightRadius={400} />
      <div className={categoryBentoStyles.inner}>
        <div className={categoryBentoStyles.header}>
          <div>
            <Badge tone="violet">Popular categories</Badge>
            <h2 className={`type-h2 ${categoryBentoStyles.title}`}>
              Browse by the job you need done.
            </h2>
          </div>
          <Button asChild className={categoryBentoStyles.actionLink} variant="secondary">
            <Link href="/categories">
              View all categories <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className={categoryBentoStyles.grid} data-magic-category-grid>
          {categories.map((category) => (
            <Link
              className={cn(
                categoryBentoStyles.card,
                category.size === "large" && categoryBentoStyles.large,
                category.size === "medium" && categoryBentoStyles.medium,
                category.size === "compact" && categoryBentoStyles.compact
              )}
              data-magic-category-card
              href={`/categories/${category.slug}`}
              key={category.name}
              style={{ "--category-accent": category.accent } as CSSProperties}
            >
              <div className={categoryBentoStyles.cardTop}>
                <span className={categoryBentoStyles.count}>{category.count} verified tools</span>
                <ArrowRight aria-hidden="true" className={categoryBentoStyles.arrow} />
              </div>

              <div className={categoryBentoStyles.cardBody}>
                <span className={categoryBentoStyles.iconWrap}>
                  <category.icon aria-hidden="true" className={categoryBentoStyles.icon} />
                </span>
                <div>
                  <h3 className={categoryBentoStyles.cardTitle}>{category.name}</h3>
                  <p className={categoryBentoStyles.description}>{category.description}</p>
                </div>
              </div>

              <div className={categoryBentoStyles.cardFooter}>
                {category.examples.map((example) => (
                  <span className={categoryBentoStyles.pill} key={example}>{example}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
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
              Discover
            </Badge>
            <h2 className="mt-4 type-h2">
              Not sure where to start? Pluto Guides.
            </h2>
            <p className="mt-5 max-w-xl type-body-lg text-white/70">
              A guided recommendation flow turns ambiguous goals into matched
              tools, clear tradeoffs and decision-ready explanations.
            </p>
            <Button asChild className="mt-7" variant="lime">
              <Link href="/pluto-guides">
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
                  <span className="number grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lime-400 type-label-lg text-ink-950">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 type-h5">
                      <step.icon aria-hidden="true" className="h-5 w-5 text-lime-400" />
                      {step.title}
                    </h3>
                    <p className="mt-2 type-body-sm text-white/68">{step.copy}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-lime-400/30 bg-lime-400 p-5 text-ink-950">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="type-h4">Top match: Gamma</p>
                  <p className="mt-2 type-body-sm">
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
          <h2 className="mt-4 type-h2 text-neutral-900">
            What builders are checking now.
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["Today", "This week", "This month"].map((item, index) => (
            <button
              className={cn(
                "focus-ring min-h-11 shrink-0 rounded-xl border px-4 type-label-md",
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
            <div className="number type-h3 text-neutral-300">
              {String(tool.rank).padStart(2, "0")}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl type-h6 text-ink-950"
                style={{ backgroundColor: tool.accent }}
              >
                {tool.name.charAt(0)}
              </span>
              <div>
                <h3 className="type-h5 text-neutral-900">
                  {tool.name}
                </h3>
                <p className="type-body-sm text-neutral-500">{tool.category}</p>
              </div>
            </div>
            <p className="type-body-sm text-neutral-700">{tool.tagline}</p>
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
          <h2 className="mt-4 type-h2 text-neutral-900">
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
                <p className="type-h4 text-neutral-900">
                  {collection.name}
                </p>
                <p className="mt-3 type-body-sm text-neutral-600">
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
          <h2 className="mt-4 type-h2 text-neutral-900">
            Calm decisions, not noisy scoreboards.
          </h2>
          <p className="mt-5 type-body-lg text-neutral-700">
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
              <span className="type-label-md text-neutral-900">Differences only</span>
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
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 type-h6 text-violet-600">
                  {tool.logo}
                </span>
                <h3 className="mt-4 type-h5 text-neutral-900">
                  {tool.name}
                </h3>
                <dl className="mt-5 grid gap-4 type-body-sm">
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
      <dt className="type-label-sm text-neutral-500">{label}</dt>
      <dd className="mt-1 type-body-sm text-neutral-900">{value}</dd>
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
          <h2 className="mt-4 type-h2">
            Built something useful? Add it to the universe.
          </h2>
          <p className="mt-4 max-w-2xl type-body-lg">
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

