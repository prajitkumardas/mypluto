import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { CompareExperience } from "@/components/compare/compare-experience";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Compare AI Tools | Pluto Finds", description: "Compare up to four AI tools across pricing, capabilities, platforms and trust signals.", path: "/compare" });

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareExperience />
    </Suspense>
  );
}

function CompareFallback() {
  return (
    <PageShell className="min-h-screen" width="standard">
      <section className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-md)]">
        <p className="type-overline text-[var(--text-brand)]">Compare AI tools</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-32 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--background-interactive)]" key={index} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
