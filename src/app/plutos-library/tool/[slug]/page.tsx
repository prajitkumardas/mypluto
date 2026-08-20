import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LibraryBadge } from "@/components/library/library-badge";
import { LibraryToolCard } from "@/components/library/library-tool-card";
import { getLibraryTool, getSimilarLibraryTools, plutosLibrary, slugify, type LibraryTool } from "@/lib/plutos-library";

type ToolDetailProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return plutosLibrary.tools.map((tool) => ({ slug: tool.slug }));
}

export default async function LibraryToolDetailPage({ params }: ToolDetailProps) {
  const { slug } = await params;
  const tool = getLibraryTool(slug);

  if (!tool) {
    notFound();
  }

  const similar = getSimilarLibraryTools(tool);
  const primaryCategory = tool.categories[0];
  const primaryCategorySlug = primaryCategory ? slugify(primaryCategory) : "";

  return (
    <main className="bg-canvas">
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <nav className="text-sm font-medium text-neutral-500">
              <Link className="hover:text-violet-600" href="/">
                Home
              </Link>{" "}
              /{" "}
              <Link className="hover:text-violet-600" href="/plutos-library">
                Pluto&apos;s Library
              </Link>
              {primaryCategory ? (
                <>
                  {" "}
                  /{" "}
                  <Link className="hover:text-violet-600" href={`/plutos-library/${primaryCategorySlug}`}>
                    {primaryCategory}
                  </Link>
                </>
              ) : null}{" "}
              / {tool.name}
            </nav>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-violet-100 font-heading text-3xl font-bold text-violet-600">
                {tool.name.charAt(0)}
              </span>
              <div>
                <LibraryBadge status={tool.verification.status} />
                <h1 className="mt-3 font-heading text-5xl font-bold text-neutral-900">
                  {tool.name}
                </h1>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-neutral-700">
                  {tool.shortDescription}
                </p>
              </div>
            </div>

            <section className="mt-8 rounded-3xl border border-neutral-200 bg-lime-100 p-6 text-ink-950 shadow-card">
              <h2 className="font-heading text-3xl font-bold">Best fit</h2>
              <p className="mt-3 text-base leading-7">
                {tool.targetAudiences.slice(0, 2).join(" and ") || "Information not yet verified"}
                {" "}working on {tool.useCases[0] || "the listed use cases"}. Pricing is listed as{" "}
                {tool.pricing.model || "Information not yet verified"}.
              </p>
            </section>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Summary label="Pricing" value={tool.pricing.model} />
              <Summary label="Free plan" value={tool.pricing.freePlan} />
              <Summary label="API" value={tool.api.normalized} />
            </div>

            <DetailSection title="Overview">
              <p>{tool.shortDescription || "Information not yet verified"}</p>
            </DetailSection>
            <DetailList title="Key features" items={tool.features} />
            <DetailList title="Best use cases" items={tool.useCases} />
            <DetailList title="Target audience" items={tool.targetAudiences} />
            <DetailList title="Supported platforms" items={tool.platforms} />
            <DetailSection title="Pricing details">
              <dl className="grid gap-3 text-sm">
                <Fact label="Pricing model" value={tool.pricing.model} />
                <Fact label="Free-plan status" value={tool.pricing.freePlanRaw || tool.pricing.freePlan} />
                <Fact label="Starting price" value={tool.pricing.startingPriceRaw} />
              </dl>
            </DetailSection>
            <DetailSection title="Limitations">
              <p>{tool.limitations || "Information not yet verified"}</p>
            </DetailSection>
            <DetailSection title="Verification">
              <dl className="grid gap-3 text-sm">
                <Fact label="Verification status" value={tool.verification.status} />
                <Fact label="Last verified" value={tool.verification.lastVerifiedRaw} />
                <Fact label="Source" value={tool.verification.sourceRaw} />
                <Fact label="Workbook status" value={tool.status} />
              </dl>
            </DetailSection>

            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
              <h2 className="font-heading text-3xl font-bold text-neutral-900">
                Similar alternatives
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {similar.map((item) =>
                  item.tool ? <LibraryToolCard key={item.slug} tool={item.tool} /> : null
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
              <h2 className="font-heading text-xl font-bold text-neutral-900">
                Directory facts
              </h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <Fact label="Category" value={tool.categories.join(", ")} />
                <Fact label="Subcategory" value={tool.subcategories.join(", ")} />
                <Fact label="Website" value={tool.domain} />
                <Fact label="API notes" value={tool.api.notes} />
              </dl>
            </div>
            <div className="mt-5 rounded-2xl bg-[#FFF3D1] p-4 text-sm leading-6 text-[#976500]">
              Missing claims are shown as information not yet verified instead
              of being inferred.
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
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-neutral-900">
        {value || "Information not yet verified"}
      </p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
      <h2 className="font-heading text-3xl font-bold text-neutral-900">{title}</h2>
      <div className="mt-4 text-base leading-7 text-neutral-700">{children}</div>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <DetailSection title={title}>
        <p>Information not yet verified</p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title={title}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            {title === "Limitations" ? (
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-neutral-500">{label}</dt>
      <dd className="mt-1 leading-6 text-neutral-900">{value || "Information not yet verified"}</dd>
    </div>
  );
}
