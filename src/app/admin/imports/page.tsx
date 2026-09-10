import Link from "next/link";
import { AlertTriangle, Database, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { PlutoButton } from "@/components/ui/pluto-button";
import summary from "@/data/generated/plutos-library-summary.json";
import { plutosLibrary } from "@/lib/plutos-library";

export default function ImportAdminPreviewPage() {
  const verificationQueue = plutosLibrary.tools
    .filter((tool) => tool.verification.status !== "Verified")
    .slice(0, 12);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin import preview"
        title="XLSX import summary and verification queue."
        description="This mirrors the protected workflow: upload XLSX, validate workbook, preview changes, review errors, confirm import and view summary."
      />

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Worksheets" value={summary.worksheetCount} />
        <Metric label="Category sheets" value={summary.categoryWorksheetCount} />
        <Metric label="Canonical tools" value={summary.canonicalToolCount} />
        <Metric label="Import errors" value={summary.importErrorCount} />
      </section>

      <section className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-3">
          <FileSpreadsheet aria-hidden="true" className="h-7 w-7 text-[var(--color-pluto-purple-300)]" />
          <h2 className="type-h2 text-[var(--text-primary)]">Preview changes</h2>
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

      <section className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-3">
          <AlertTriangle aria-hidden="true" className="h-7 w-7 text-[var(--status-warning)]" />
          <h2 className="type-h2 text-[var(--text-primary)]">Verification review queue</h2>
        </div>
        <div className="mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)]">
          {verificationQueue.map((tool) => (
            <div className="grid gap-3 border-b border-[var(--border-default)] p-4 last:border-b-0 md:grid-cols-[1fr_180px_180px]" key={tool.slug}>
              <div>
                <Link className="type-h5 text-[var(--text-primary)] hover:text-[var(--color-pluto-purple-300)]" href={`/plutos-library/tool/${tool.slug}`}>
                  {tool.name}
                </Link>
                <p className="mt-1 type-body-sm text-[var(--text-secondary)]">{tool.categories.join(", ")}</p>
              </div>
              <p className="type-label-md text-[var(--status-warning)]">{tool.verification.status}</p>
              <p className="type-body-sm text-[var(--text-tertiary)]">{tool.verification.lastVerifiedRaw}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--background-section)] p-6 text-[var(--text-primary)] shadow-[var(--shadow-xs)]">
        <Database aria-hidden="true" className="h-8 w-8 text-[var(--text-brand)]" />
        <h2 className="mt-4 type-h2">Database handoff</h2>
        <p className="mt-3 max-w-[var(--text-width-md)] type-body-sm text-[var(--text-secondary)]">
          The normalized PostgreSQL schema is in `supabase/migrations`. Workbook values are preserved as raw values and normalized fields so re-imports can avoid duplicates and keep admin-approved data precedence.
        </p>
        <PlutoButton className="mt-5" href="/plutos-library" showArrow variant="primary">
          Open Discover
        </PlutoButton>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-xs)]">
      <dt className="type-label-md text-[var(--text-tertiary)]">{label}</dt>
      <dd className="number mt-2 type-h2 text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

function Change({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--background-interactive)] p-4">
      <p className="number type-h3 text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 type-label-md text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
