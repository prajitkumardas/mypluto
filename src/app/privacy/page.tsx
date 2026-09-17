import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy Draft | Pluto Finds",
  description: "Review the current Pluto Finds privacy data-flow inventory and draft policy structure.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <PageShell width="content">
      <PageHeader
        eyebrow="Privacy"
        eyebrowTone="neutral"
        title="Local-first public discovery."
        description="Pluto's primary journey does not require login. Recently viewed tools, saved tools and compare selections are stored on this device only."
      />
      <aside className="mt-8 rounded-[var(--radius-lg)] border border-amber-300/35 bg-amber-300/10 p-5 text-[var(--text-primary)]" role="note">
        <strong>Draft for legal review.</strong> Confirm vendors, retention periods, lawful bases, jurisdiction-specific rights, controller identity and contact details before publication as a final policy.
      </aside>
      <div className="mt-10 grid gap-8 type-body-md text-[var(--text-secondary)]">
        <section><h2 className="type-h2 text-[var(--text-primary)]">Current product data flows</h2><p className="mt-3">Public discovery does not require an account. Compare selections, recently viewed tools, Guide answers, Play profile data, PWA visit counts and install-prompt dismissal timestamps are stored in the browser. An in-progress tool-submission draft can also be stored on the device, including the submitter email once entered, until the draft is submitted or cleared. Tool submissions send the form fields to Pluto Finds for duplicate checking and review.</p></section>
        <section><h2 className="type-h2 text-[var(--text-primary)]">Policy sections requiring approval</h2><ul className="mt-3 list-disc space-y-2 pl-6"><li>Data categories, purposes, lawful bases and retention.</li><li>Supabase and hosting providers, subprocessors and international transfers.</li><li>Cookies or analytics, if introduced.</li><li>Access, correction, deletion, objection and complaint rights.</li><li>Security, children&apos;s privacy, changes and the privacy contact.</li></ul></section>
      </div>
    </PageShell>
  );
}
