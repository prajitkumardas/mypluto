"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/data";

const steps = [
  "Tool identity",
  "Duplicate check",
  "Product details",
  "Submitter info",
  "Review"
];

export function SubmitToolFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const duplicate = useMemo(
    () => tools.find((tool) => tool.name.toLowerCase() === name.trim().toLowerCase()),
    [name]
  );
  const unsafeUrl = url.length > 0 && !/^https:\/\/.+\..+/.test(url);

  if (submitted) {
    return (
      <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-elevated">
          <Badge icon tone="success">Submission received</Badge>
          <h1 className="mt-5 font-heading text-5xl font-bold text-neutral-900">
            Your tool has been submitted for review.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
            Reference PLU-2026-1842. The moderation queue checks duplicates,
            pricing, official links and feature claims before publication.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">Return home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/tools">Discover similar tools</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="violet">Submit a Tool</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        Submit an AI tool for verification.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        No account is required. Your draft is treated as local session progress,
        and submission does not guarantee publication or featured placement.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-5">
        {steps.map((label, index) => (
          <div
            className={`rounded-2xl border p-4 text-sm font-bold ${
              index === step
                ? "border-violet-600 bg-violet-100 text-violet-600"
                : index < step
                  ? "border-[#157A4A] bg-[#E3F8EC] text-[#157A4A]"
                  : "border-neutral-200 bg-white text-neutral-500"
            }`}
            key={label}
          >
            <span className="number">{index + 1}.</span> {label}
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card">
        {step === 0 ? (
          <div className="grid gap-5">
            <Field label="Tool name" onChange={setName} placeholder="Example: Pluto Studio" value={name} />
            <Field label="Official website URL" onChange={setUrl} placeholder="https://example.com" value={url} />
            {unsafeUrl ? (
              <InlineError copy="Use a valid HTTPS official website URL. Your entered information is preserved." />
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            {duplicate ? (
              <div className="rounded-2xl bg-[#FFF3D1] p-5 text-[#976500]">
                <AlertTriangle aria-hidden="true" className="h-6 w-6" />
                <h2 className="mt-3 font-heading text-2xl font-bold">Possible duplicate found</h2>
                <p className="mt-2 text-sm leading-6">
                  {duplicate.name} already exists. You can view the listing,
                  report incorrect information or continue only if this is a
                  different product.
                </p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href={`/tools/${duplicate.slug}`}>View existing listing</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#E3F8EC] p-5 text-[#157A4A]">
                <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
                <h2 className="mt-3 font-heading text-2xl font-bold">No duplicate detected</h2>
                <p className="mt-2 text-sm leading-6">Continue with product details.</p>
              </div>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tagline" placeholder="Short product promise" />
            <Field label="Primary category" placeholder="Creative, Development, Research..." />
            <Field label="Pricing model" placeholder="Free, Freemium, Paid, Open source" />
            <Field label="Platforms" placeholder="Web, iOS, Android, API..." />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Your email" placeholder="you@example.com" />
            <Field label="Relationship to product" placeholder="Founder, user, agency representative" />
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <Badge tone="lime">Review</Badge>
            <h2 className="mt-4 font-heading text-3xl font-bold text-neutral-900">
              Confirm submission policy
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">
              Pluto will verify official website availability, pricing and key
              features before publication. AI-detected changes require admin approval.
            </p>
            <label className="mt-5 flex min-h-12 items-center gap-3 rounded-xl border border-neutral-200 px-3 text-sm font-semibold">
              <input className="h-4 w-4 accent-violet-600" type="checkbox" />
              I confirm this information is accurate to the best of my knowledge.
            </label>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-neutral-200 pt-5 sm:flex-row">
          <Button disabled={step === 0} onClick={() => setStep((value) => value - 1)} variant="secondary">
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={unsafeUrl || (step === 0 && (!name || !url))} onClick={() => setStep((value) => value + 1)}>
              Continue <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setSubmitted(true)}>
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Submit for review
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-900">
      {label}
      <input
        className="min-h-12 rounded-xl border border-neutral-200 px-3 text-neutral-900 outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function InlineError({ copy }: { copy: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#FFE8E8] p-4 text-sm font-semibold text-[#C33838]">
      <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0" />
      {copy}
    </div>
  );
}
