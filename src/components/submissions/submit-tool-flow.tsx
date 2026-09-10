"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { PlutoButton } from "@/components/ui/pluto-button";
import { tools } from "@/lib/data";
import { cn } from "@/lib/utils";

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
      <PageShell width="content">
        <section className="rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-8 shadow-[var(--shadow-md)]">
          <PageHeader
            eyebrow="Submission received"
            eyebrowTone="success"
            title="Your tool has been submitted for review."
            description="Reference PLU-2026-1842. The moderation queue checks duplicates, pricing, official links and feature claims before publication."
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PlutoButton href="/" variant="primary">Return home</PlutoButton>
            <PlutoButton href="/tools" variant="secondary">Discover similar tools</PlutoButton>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Submit a Tool"
        title="Submit an AI tool for verification."
        description="No account is required. Your draft is treated as local session progress, and submission does not guarantee publication or featured placement."
      />

      <div className="mt-8 grid gap-3 md:grid-cols-5">
        {steps.map((label, index) => (
          <div
            className={cn(
              "rounded-[var(--radius-lg)] border p-4 type-label-md transition duration-200",
              index === step && "border-[var(--border-brand)] bg-[var(--surface-selected)] text-[var(--color-pluto-purple-300)]",
              index < step && "border-[rgba(117,242,142,0.34)] bg-[rgba(117,242,142,0.1)] text-[var(--status-success)]",
              index > step && "border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-tertiary)]"
            )}
            key={label}
          >
            <span className="number">{index + 1}.</span> {label}
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-xs)]">
        {step === 0 ? (
          <div className="grid gap-5">
            <Field label="Tool name" onChange={setName} placeholder="Example: Pluto Studio" value={name} />
            <Field label="Official website URL" onChange={setUrl} placeholder="https://example.com" value={url} />
            {unsafeUrl ? <InlineError copy="Use a valid HTTPS official website URL. Your entered information is preserved." /> : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            {duplicate ? (
              <div className="rounded-[var(--radius-xl)] border border-[rgba(255,211,110,0.32)] bg-[rgba(255,211,110,0.1)] p-5 text-[var(--status-warning)]">
                <AlertTriangle aria-hidden="true" className="h-6 w-6" />
                <h2 className="mt-3 type-h2">Possible duplicate found</h2>
                <p className="mt-2 type-body-sm text-[var(--text-secondary)]">
                  {duplicate.name} already exists. You can view the listing, report incorrect information or continue only if this is a different product.
                </p>
                <PlutoButton className="mt-4" href={`/tools/${duplicate.slug}`} variant="secondary">View existing listing</PlutoButton>
              </div>
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-[rgba(117,242,142,0.34)] bg-[rgba(117,242,142,0.1)] p-5 text-[var(--status-success)]">
                <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
                <h2 className="mt-3 type-h2">No duplicate detected</h2>
                <p className="mt-2 type-body-sm text-[var(--text-secondary)]">Continue with product details.</p>
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
            <h2 className="mt-4 type-h2 text-[var(--text-primary)]">Confirm submission policy</h2>
            <p className="mt-3 type-body-sm text-[var(--text-secondary)]">
              Pluto will verify official website availability, pricing and key features before publication. AI-detected changes require admin approval.
            </p>
            <label className="mt-5 flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 type-label-md text-[var(--text-primary)]">
              <input className="h-4 w-4 accent-[var(--action-primary)]" type="checkbox" />
              I confirm this information is accurate to the best of my knowledge.
            </label>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[var(--border-default)] pt-5 sm:flex-row">
          <PlutoButton disabled={step === 0} onClick={() => setStep((value) => value - 1)} type="button" variant="secondary">
            Back
          </PlutoButton>
          {step < steps.length - 1 ? (
            <PlutoButton disabled={unsafeUrl || (step === 0 && (!name || !url))} onClick={() => setStep((value) => value + 1)} showArrow type="button" variant="primary">
              Continue
            </PlutoButton>
          ) : (
            <PlutoButton onClick={() => setSubmitted(true)} type="button" variant="primary">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Submit for review
            </PlutoButton>
          )}
        </div>
      </section>
    </PageShell>
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
    <label className="grid gap-2 type-label-md text-[var(--text-primary)]">
      {label}
      <input
        className="min-h-12 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--background-interactive)] px-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--border-brand)] focus:ring-4 focus:ring-[rgba(145,61,255,0.18)] placeholder:text-[var(--text-tertiary)]"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function InlineError({ copy }: { copy: string }) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-lg)] border border-[rgba(255,138,138,0.34)] bg-[rgba(255,138,138,0.1)] p-4 type-label-md text-[var(--status-danger)]">
      <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0" />
      {copy}
    </div>
  );
}
