import Link from "next/link";
import { AlertTriangle, ArrowRight, Database, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import summary from "@/data/generated/plutos-library-summary.json";
import { plutosLibrary } from "@/lib/plutos-library";

export default function ImportAdminPreviewPage() {
  const verificationQueue = plutosLibrary.tools
    .filter((tool) => tool.verification.status !== "Verified")
    .slice(0, 12);

  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="violet">Admin import preview</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        XLSX import summary and verification queue.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        This mirrors the protected workflow: upload XLSX, validate workbook,
        preview changes, review errors, confirm import and view summary.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Worksheets" value={summary.worksheetCount} />
        <Metric label="Category sheets" value={summary.categoryWorksheetCount} />
        <Metric label="Canonical tools" value={summary.canonicalToolCount} />
        <Metric label="Import errors" value={summary.importErrorCount} />
      </section>

      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <FileSpreadsheet aria-hidden="true" className="h-7 w-7 text-violet-600" />
          <h2 className="font-heading text-3xl font-bold text-neutral-900">
            Preview changes
          </h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Change label="New or updated tools" value={summary.canonicalToolCount} />
          <Change label="Categories" value={summary.categoryCount} />
          <Change label="Subcategories" value={summary.subcategoryCount} />
          <Change label="Rows needing verification" value={summary.needsVerificationCount} />
          <Change label="Verified rows" value={summary.verifiedCount} />
          <Change label="Recently added rows" value={summary.recentlyAddedCount} />
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <AlertTriangle aria-hidden="true" className="h-7 w-7 text-[#976500]" />
          <h2 className="font-heading text-3xl font-bold text-neutral-900">
            Verification review queue
          </h2>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
          {verificationQueue.map((tool) => (
            <div className="grid gap-3 border-b border-neutral-200 p-4 last:border-b-0 md:grid-cols-[1fr_180px_180px]" key={tool.slug}>
              <div>
                <Link className="font-heading text-xl font-bold text-neutral-900 hover:text-violet-600" href={`/plutos-library/tool/${tool.slug}`}>
                  {tool.name}
                </Link>
                <p className="mt-1 text-sm text-neutral-600">{tool.categories.join(", ")}</p>
              </div>
              <p className="text-sm font-semibold text-[#976500]">{tool.verification.status}</p>
              <p className="text-sm text-neutral-500">{tool.verification.lastVerifiedRaw}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-ink-950 p-6 text-white">
        <Database aria-hidden="true" className="h-8 w-8 text-lime-400" />
        <h2 className="mt-4 font-heading text-3xl font-bold">Database handoff</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          The normalized PostgreSQL schema is in `supabase/migrations`. Workbook
          values are preserved as raw values and normalized fields so re-imports
          can avoid duplicates and keep admin-approved data precedence.
        </p>
        <Button asChild className="mt-5" variant="lime">
          <Link href="/plutos-library">
            Open Pluto&apos;s Library <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
      <dt className="text-sm font-semibold text-neutral-500">{label}</dt>
      <dd className="number mt-2 font-heading text-4xl font-bold text-neutral-900">
        {value}
      </dd>
    </div>
  );
}

function Change({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <p className="number font-heading text-3xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-600">{label}</p>
    </div>
  );
}
