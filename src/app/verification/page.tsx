import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VerificationPage() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge icon tone="success">Verification methodology</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        Trust is workflow, not a decorative badge.
      </h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {["Website available", "Pricing checked", "Features reviewed"].map((item) => (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-card" key={item}>
            <ShieldCheck aria-hidden="true" className="h-7 w-7 text-violet-600" />
            <h2 className="mt-5 font-heading text-2xl font-bold text-neutral-900">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              AI can detect possible changes, but admin review is required before
              critical data is published.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
