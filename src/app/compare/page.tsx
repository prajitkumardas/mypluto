import { Suspense } from "react";
import { CompareExperience } from "@/components/compare/compare-experience";

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareExperience />
    </Suspense>
  );
}

function CompareFallback() {
  return (
    <main className="min-h-screen bg-ink-950 px-4 pt-32 text-white">
      <section className="mx-auto max-w-6xl rounded-[24px] border border-white/12 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-300">Compare AI tools</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-32 rounded-2xl border border-white/10 bg-white/[0.04]" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}