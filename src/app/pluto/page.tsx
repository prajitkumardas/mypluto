import Link from "next/link";
import { ArrowRight, Bot, Library, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { collections, librarySteps, tools } from "@/lib/data";

export default function PlutoPage() {
  return (
    <main>
      <section className="bg-ink-950 py-20 text-white orbit-grid">
        <div className="mx-auto max-w-site px-5 sm:px-8 xl:px-0">
          <Badge className="bg-white/8 text-lime-400" tone="neutral">
            Pluto&apos;s Library
          </Badge>
          <h1 className="mt-5 max-w-3xl font-heading text-6xl font-bold">
            A branded space for intelligent discovery.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Ask Pluto when your requirement is still fuzzy, or browse curated
            collections when you know the workflow you want to improve.
          </p>
          <Button asChild className="mt-8" size="lg" variant="lime">
            <Link href="/pluto/ask">
              Ask Pluto <Sparkles aria-hidden="true" className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-site px-5 py-20 sm:px-8 xl:px-0">
        <div className="grid gap-5 md:grid-cols-3">
          {librarySteps.map((step) => (
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card" key={step.title}>
              <step.icon aria-hidden="true" className="h-7 w-7 text-violet-600" />
              <h2 className="mt-5 font-heading text-2xl font-bold text-neutral-900">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{step.copy}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 font-heading text-4xl font-bold text-neutral-900">
          Curated collections
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <Link
              className="focus-ring rounded-3xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet-500"
              href={`/collections/${collection.slug}`}
              key={collection.slug}
            >
              <Library aria-hidden="true" className="h-7 w-7 text-violet-600" />
              <h3 className="mt-5 font-heading text-2xl font-bold text-neutral-900">
                {collection.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{collection.description}</p>
            </Link>
          ))}
        </div>

        <section className="mt-16 rounded-3xl bg-lime-400 p-6 text-ink-950 md:p-10">
          <Bot aria-hidden="true" className="h-9 w-9" />
          <h2 className="mt-4 font-heading text-4xl font-bold">Pluto&apos;s picks</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {tools.slice(0, 3).map((tool) => (
              <Link className="rounded-2xl bg-white p-5" href={`/tools/${tool.slug}`} key={tool.slug}>
                <h3 className="font-heading text-xl font-bold">{tool.name}</h3>
                <p className="mt-2 text-sm leading-6">{tool.bestFor}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                  Evaluate <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
