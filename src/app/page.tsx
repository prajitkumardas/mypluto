import {
  ArrowRight,
  ExternalLink,
  Library,
  Plus,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { DiscoverGuideSection } from "@/components/home/discover-guide-section";
import { PlutoHero } from "@/components/home/pluto-hero";
import { PopularCategoriesShowcase } from "@/components/home/popular-categories-showcase";
import { PlutoStorySection } from "@/components/home/pluto-story-section";
import {
  ContentBlockReveal,
  RevealGroup,
  SectionEyebrowReveal,
  WordReveal
} from "@/components/motion/scroll-reveals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  collections,
  trendingTools
} from "@/lib/data";
import Silk from "@/components/ui/silk";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main>
      <PlutoHero />
      <PlutoStorySection />
      <PopularCategoriesShowcase />
      <DiscoverGuideSection />
      <Trending />
      <Collections />
      <SubmitCta />
    </main>
  );
}

function Trending() {
  return (
    <section className="site-section" id="trending">
      <div className="site-container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrowReveal>
              <Badge tone="lime">Trending tools</Badge>
            </SectionEyebrowReveal>
            <WordReveal
              as="h2"
              className="mt-4 type-h2 text-neutral-900"
              text="What builders are checking now."
            />
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

        <ContentBlockReveal className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card">
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
        </ContentBlockReveal>
      </div>
    </section>
  );
}

function Collections() {
  return (
    <section className="site-section bg-neutral-50">
      <div className="site-container">
        <div className="max-w-3xl">
          <SectionEyebrowReveal>
            <Badge tone="violet">Curated collections</Badge>
          </SectionEyebrowReveal>
          <WordReveal
            as="h2"
            className="mt-4 type-h2 text-neutral-900"
            text="Editorial paths through the tool universe."
          />
        </div>
        <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4" itemClassName="h-full" stagger={0.08}>
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
        </RevealGroup>
      </div>
    </section>
  );
}

function SubmitCta() {
  return (
    <section className="site-section">
      <div className="site-container">
        <div className="relative isolate grid gap-8 overflow-hidden rounded-[2rem] border border-neutral-200 bg-ink-950 p-6 text-white shadow-elevated md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div aria-hidden="true" className="absolute inset-0 z-0 opacity-80">
            <Silk
              color="#5227FF"
              noiseIntensity={1.5}
              rotation={0}
              scale={1}
              speed={5}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[linear-gradient(110deg,rgba(21,21,21,0.78),rgba(21,21,21,0.56)_48%,rgba(200,255,90,0.16))]"
          />
          <div className="relative z-20">
            <SectionEyebrowReveal>
              <Badge className="text-lime-400" tone="neutral">
                Submit a Tool
              </Badge>
            </SectionEyebrowReveal>
            <WordReveal
              as="h2"
              className="mt-4 type-h2"
              text="Built something useful? Add it to the universe."
            />
            <ContentBlockReveal as="p" className="mt-4 max-w-2xl type-body-md text-white/78" delay={0.08}>
              A guided submission flow will capture product details, pricing,
              platform support and verification notes without one long form.
            </ContentBlockReveal>
          </div>
          <Button asChild className="relative z-20 bg-[#ffffff] text-[#6C4DFF] hover:bg-violet-100" size="lg">
            <Link href="/submit-tool">
              Start submission <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
