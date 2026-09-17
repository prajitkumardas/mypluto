import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";

type LegalSection = {
  heading: string;
  points: string[];
};

export function LegalDraftPage({ description, sections, title }: { description: string; sections: LegalSection[]; title: string }) {
  return (
    <PageShell width="content">
      <PageHeader eyebrow="Draft for legal review" eyebrowTone="neutral" title={title} description={description} />
      <aside className="mt-8 rounded-[var(--radius-lg)] border border-amber-300/35 bg-amber-300/10 p-5 text-[var(--text-primary)]" role="note">
        <strong>Not final legal language.</strong> This page is an engineering content structure. Counsel and the product owner must approve the wording, jurisdiction, effective date, contact details and operational commitments before launch.
      </aside>
      <div className="mt-10 grid gap-8">
        {sections.map((section) => (
          <section aria-labelledby={`legal-${slugify(section.heading)}`} key={section.heading}>
            <h2 className="type-h2 text-[var(--text-primary)]" id={`legal-${slugify(section.heading)}`}>{section.heading}</h2>
            <ul className="mt-4 grid list-disc gap-3 pl-6 type-body-md text-[var(--text-secondary)]">
              {section.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
