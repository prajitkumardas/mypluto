import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Flag,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/tool-card";
import { ViewedMarker } from "@/components/tools/viewed-marker";
import { getTool, tools } from "@/lib/data";
import { LibraryBadge } from "@/components/library/library-badge";
import { LibraryToolCard } from "@/components/library/library-tool-card";
import {
  getLibraryTool,
  getSimilarLibraryTools,
  type LibraryTool
} from "@/lib/plutos-library";

type ToolDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function ToolDetailPage({ params }: ToolDetailProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  const libraryTool = getLibraryTool(slug);

  if (!tool && !libraryTool) {
    notFound();
  }

  if (!tool && libraryTool) {
    return <ImportedToolDetail tool={libraryTool} />;
  }

  if (!tool) {
    notFound();
  }

  const alternatives = tool.alternatives
    .map((altSlug) => tools.find((candidate) => candidate.slug === altSlug))
    .filter(Boolean);

  return (
    <main className="bg-canvas">
      <ViewedMarker slug={tool.slug} />
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <nav className="type-label-md text-neutral-500">
              <Link className="hover:text-violet-600" href="/tools">
                All AI Tools
              </Link>{" "}
              / {tool.name}
            </nav>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <span
                className="grid h-20 w-20 place-items-center rounded-3xl type-h3 text-ink-950"
                style={{ backgroundColor: tool.accent }}
              >
                {tool.name.charAt(0)}
              </span>
              <div>
                <Badge icon tone="success">
                  {tool.verification.status}
                </Badge>
                <h1 className="mt-3 type-h1 text-neutral-900">
                  {tool.name}
                </h1>
                <p className="mt-3 max-w-2xl type-body-xl text-neutral-700">
                  {tool.tagline}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Summary label="Best for" value={tool.bestFor} />
              <Summary label="Starting price" value={tool.startingPrice} />
              <Summary label="API" value={tool.api} />
            </div>

            <DetailSection title="Overview">
              <p>{tool.description}</p>
            </DetailSection>
            <DetailList title="Key features" items={tool.features} />
            <DetailList title="Best use cases" items={tool.useCases} />
            <DetailList title="Platforms and integrations" items={[...tool.platforms, ...tool.integrations]} />
            <DetailList title="Advantages" items={tool.advantages} />
            <DetailList title="Limitations" items={tool.limitations} icon="warning" />

            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
              <h2 className="type-h3 text-neutral-900">
                Alternatives
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {alternatives.map((alternative) =>
                  alternative ? <ToolCard key={alternative.slug} tool={alternative} variant="compact" /> : null
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-5 shadow-elevated lg:sticky lg:top-28">
            <Button asChild className="w-full" size="lg">
              <a href={tool.officialUrl} rel="noreferrer" target="_blank">
                Explore Tool <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild className="mt-3 w-full" size="lg" variant="secondary">
              <Link href="/compare">
                Add to Compare <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
            <div className="mt-5 rounded-2xl bg-lime-100 p-4 type-body-sm text-ink-950">
              Explore Tool opens the official website. Pluto preserves your
              current comparison and recent history on this device.
            </div>

            <div className="mt-5 rounded-2xl border border-neutral-200 p-4">
              <h2 className="flex items-center gap-2 type-h5 text-neutral-900">
                <ShieldCheck aria-hidden="true" className="h-5 w-5 text-violet-600" />
                Verification
              </h2>
              <dl className="mt-4 grid gap-3 type-body-sm">
                <CheckRow label="Website verified" value={tool.verification.website} />
                <CheckRow label="Pricing verified" value={tool.verification.pricing} />
                <CheckRow label="Features verified" value={tool.verification.features} />
                <div>
                  <dt className="type-label-md text-neutral-500">Last checked</dt>
                  <dd className="mt-1 text-neutral-900">{tool.verified}</dd>
                </div>
              </dl>
            </div>

            <Button className="mt-3 w-full" variant="ghost">
              <Flag aria-hidden="true" className="h-4 w-4" />
              Report incorrect information
            </Button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ImportedToolDetail({ tool }: { tool: LibraryTool }) {
  const similar = getSimilarLibraryTools(tool);

  return (
    <main className="bg-canvas">
      <ViewedMarker slug={tool.slug} />
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <nav className="type-label-md text-neutral-500">
              <Link className="hover:text-violet-600" href="/plutos-library">
                Discover
              </Link>{" "}
              / {tool.name}
            </nav>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-violet-100 type-h3 text-violet-600">
                {tool.name.charAt(0)}
              </span>
              <div>
                <LibraryBadge status={tool.verification.status} />
                <h1 className="mt-3 type-h1 text-neutral-900">
                  {tool.name}
                </h1>
                <p className="mt-3 max-w-2xl type-body-xl text-neutral-700">
                  {tool.shortDescription}
                </p>
              </div>
            </div>

            <section className="mt-8 rounded-3xl border border-neutral-200 bg-lime-100 p-6 text-ink-950 shadow-card">
              <h2 className="type-h3">Pluto says</h2>
              <p className="mt-3 type-body-lg">
                This tool may suit {tool.targetAudiences.slice(0, 2).join(" and ") || "users"}
                {" "}working on {tool.useCases[0] || "the listed use cases"}. Pricing is listed as{" "}
                {tool.pricing.model}; verification is {tool.verification.status.toLowerCase()}, so
                confirm important pricing and feature claims on the official website.
              </p>
            </section>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Summary label="Pricing model" value={tool.pricing.model} />
              <Summary label="Free plan" value={tool.pricing.freePlan} />
              <Summary label="API" value={tool.api.normalized} />
            </div>

            <DetailSection title="Overview">
              <p>{tool.shortDescription}</p>
            </DetailSection>
            <DetailList title="A good fit if you need" items={tool.useCases} />
            <DetailList title="What it brings" items={tool.features} />
            <DetailList title="Platforms" items={tool.platforms} />
            <DetailList title="Ideal users" items={tool.targetAudiences} />
            <DetailSection title="Pricing">
              <dl className="grid gap-3 type-body-sm">
                <CompareFact label="Pricing model" value={tool.pricing.model} />
                <CompareFact label="Free plan" value={tool.pricing.freePlanRaw || tool.pricing.freePlan} />
                <CompareFact label="Starting price" value={tool.pricing.startingPriceRaw} />
              </dl>
            </DetailSection>
            <DetailSection title="Limitations">
              <p>{tool.limitations}</p>
            </DetailSection>
            <DetailSection title="Verification and sources">
              <dl className="grid gap-3 type-body-sm">
                <CompareFact label="Verification status" value={tool.verification.status} />
                <CompareFact label="Last checked" value={tool.verification.lastVerifiedRaw} />
                <CompareFact label="Source" value={tool.verification.sourceRaw} />
                <CompareFact label="Workbook status" value={tool.status} />
              </dl>
            </DetailSection>

            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
              <h2 className="type-h3 text-neutral-900">
                Similar tools
              </h2>
              <p className="mt-3 type-body-sm text-neutral-700">
                Similarity uses shared category, subcategories, use cases,
                features, audience, pricing, platforms, API and verification state.
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {similar.map((item) =>
                  item.tool ? (
                    <div key={item.slug}>
                      <LibraryToolCard tool={item.tool} />
                      <p className="mt-2 type-label-sm text-neutral-500">
                        Similarity score: {item.score}. {item.reason}
                      </p>
                    </div>
                  ) : null
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-5 shadow-elevated lg:sticky lg:top-28">
            <Button asChild className="w-full" size="lg">
              <a href={tool.officialUrl || tool.originalOfficialUrl} rel="noreferrer" target="_blank">
                Visit official site <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild className="mt-3 w-full" size="lg" variant="secondary">
              <Link href="/compare">
                Add to Compare <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
            <div className="mt-5 rounded-2xl border border-neutral-200 p-4">
              <h2 className="type-h5 text-neutral-900">
                Verification snapshot
              </h2>
              <div className="mt-4">
                <LibraryBadge status={tool.verification.status} />
              </div>
              <dl className="mt-4 grid gap-3 type-body-sm">
                <CompareFact label="Last checked" value={tool.verification.lastVerifiedRaw} />
                <CompareFact label="Pricing" value="Confirm on official website" />
                <CompareFact label="Website status" value={tool.status} />
                <CompareFact label="Source" value={tool.verification.sourceRaw} />
              </dl>
            </div>
            <Button className="mt-3 w-full" variant="ghost">
              <Flag aria-hidden="true" className="h-4 w-4" />
              Report incorrect information
            </Button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
      <p className="type-label-md text-neutral-500">{label}</p>
      <p className="mt-2 type-h4 text-neutral-900">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
      <h2 className="type-h3 text-neutral-900">{title}</h2>
      <div className="mt-4 type-body-lg text-neutral-700">{children}</div>
    </section>
  );
}

function DetailList({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon?: "warning";
}) {
  return (
    <DetailSection title={title}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            {icon === "warning" ? (
              <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#976500]" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#157A4A]" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

function CheckRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="type-label-md text-neutral-500">{label}</dt>
      <dd className="inline-flex items-center gap-1 type-label-md text-[#157A4A]">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        {value ? "Yes" : "No"}
      </dd>
    </div>
  );
}

function CompareFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-label-md text-neutral-500">{label}</dt>
      <dd className="mt-1 type-body-sm text-neutral-900">{value || "Information not available"}</dd>
    </div>
  );
}

