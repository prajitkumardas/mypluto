"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/tool-card";
import { tools } from "@/lib/data";

const steps = [
  {
    title: "What are you trying to accomplish?",
    options: ["Create cinematic Instagram reels", "Remove product-image backgrounds", "Create a presentation from a PDF"]
  },
  {
    title: "What is your budget?",
    options: ["Freemium or free plan", "Paid tools are okay", "Not sure"]
  },
  {
    title: "What is your experience level?",
    options: ["Beginner", "Intermediate", "Professional", "Skip"]
  }
];

export function PlutoWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const isComplete = step >= steps.length;

  function choose(answer: string) {
    setAnswers((current) => [...current.slice(0, step), answer]);
  }

  return (
    <main className="bg-ink-950 text-white orbit-grid">
      <section className="mx-auto min-h-[calc(100svh-80px)] max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        <Badge className="bg-white/8 text-lime-400" tone="neutral">
          Ask Pluto
        </Badge>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h1 className="type-h1">Guided recommendation flow</h1>
            <p className="mt-4 type-body-lg text-white/70">
              Pluto asks only essential questions, preserves progress and returns
              recommendations with match reasons, limitations and verification dates.
            </p>
            <div className="mt-6 grid gap-3">
              {["Understanding your request", "Matching required features", "Checking pricing", "Reviewing verified tools", "Ranking best options"].map(
                (item, index) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 type-body-sm" key={item}>
                    {index < step ? (
                      <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-lime-400" />
                    ) : (
                      <Loader2 aria-hidden="true" className="h-5 w-5 text-white/40" />
                    )}
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <section className="rounded-3xl bg-white p-5 text-neutral-900 shadow-overlay">
            {!isComplete ? (
              <>
                <p className="number type-label-md text-violet-600">
                  Step {step + 1} of {steps.length}
                </p>
                <h2 className="mt-3 type-h2">{steps[step].title}</h2>
                <div className="mt-6 grid gap-3">
                  {steps[step].options.map((option) => (
                    <button
                      className="focus-ring min-h-14 rounded-2xl border border-neutral-200 px-4 text-left type-label-md transition hover:border-violet-500"
                      key={option}
                      onClick={() => choose(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between gap-3">
                  <Button disabled={step === 0} onClick={() => setStep((value) => value - 1)} variant="secondary">
                    Back
                  </Button>
                  <Button onClick={() => setStep((value) => value + 1)}>
                    Continue <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Badge icon tone="success">
                  Recommendations ready
                </Badge>
                <h2 className="mt-4 type-h2">Three strong matches</h2>
                <p className="mt-3 type-body-sm text-neutral-700">
                  Interpretation: {answers.filter(Boolean).join(" / ") || "cinematic product videos"}.
                </p>
                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  {tools.slice(0, 3).map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} variant="featured" />
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/compare">Compare recommendations</Link>
                  </Button>
                  <Button onClick={() => { setStep(0); setAnswers([]); }} variant="secondary">
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                    Start over
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
