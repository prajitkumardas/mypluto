"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/lib/compare-store";
import {
  emptyGuideAnswers,
  guideBudgets,
  guideGoals,
  guidePlatforms,
  guidePreferences,
  guideRequirements,
  type GuideAnswers,
  type GuideRecommendation
} from "@/lib/pluto-guides-options";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pluto-guides-draft";
const steps = ["Your goal", "Task", "Preferences", "Requirements"];

export function PlutoGuidesFlow() {
  const [screen, setScreen] = useState<"intro" | "questions" | "loading" | "results">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<GuideAnswers>(emptyGuideAnswers);
  const [recommendations, setRecommendations] = useState<GuideRecommendation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const frame = window.requestAnimationFrame(() => {
      try {
        const parsed = JSON.parse(saved) as { answers: GuideAnswers; step: number };
        setAnswers({ ...emptyGuideAnswers, ...parsed.answers });
        setStep(Math.min(Math.max(parsed.step, 0), steps.length - 1));
        setScreen("questions");
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (screen !== "questions") return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
  }, [answers, screen, step]);

  const currentGoal = useMemo(
    () => guideGoals.find((item) => item.id === answers.goal),
    [answers.goal]
  );

  const canContinue =
    (step === 0 && Boolean(answers.goal)) ||
    (step === 1 && Boolean(answers.primaryTask)) ||
    step === 2 ||
    (step === 3 && Boolean(answers.budget));

  const updateAnswers = (partial: Partial<GuideAnswers>) => {
    setAnswers((current) => ({ ...current, ...partial }));
  };

  const startAgain = () => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setAnswers(emptyGuideAnswers);
    setRecommendations([]);
    setError("");
    setStep(0);
    setScreen("intro");
  };

  const submit = async () => {
    setScreen("loading");
    setError("");
    try {
      const response = await fetch("/api/pluto-guides/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
      });
      if (!response.ok) throw new Error("Recommendation request failed");
      const data = (await response.json()) as { recommendations: GuideRecommendation[] };
      setRecommendations(data.recommendations);
      window.sessionStorage.removeItem(STORAGE_KEY);
      setScreen("results");
    } catch {
      setError("Pluto Guides could not finish the match. Please try again.");
      setScreen("questions");
    }
  };

  const handleNext = () => {
    if (!canContinue) return;
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    void submit();
  };

  return (
    <main className="bg-canvas text-white">
      <section className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        {screen === "intro" ? (
          <IntroScreen onStart={() => setScreen("questions")} />
        ) : null}

        {screen === "questions" ? (
          <section className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="type-overline text-lime-300">Pluto Guides</p>
                <h1 className="mt-3 type-h2 text-white">Find the right AI tools in four questions.</h1>
                <p className="mt-3 max-w-2xl type-body-md text-white/68">
                  Answer only what matters. Pluto ranks the library with explainable matches.
                </p>
              </div>
              <Button className="w-fit" onClick={startAgain} type="button" variant="outline">
                <RotateCcw aria-hidden="true" className="h-5 w-5" />
                Start over
              </Button>
            </div>

            <Progress step={step} />

            <div className="mt-8 rounded-3xl border border-white/12 bg-white/8 p-5 shadow-card backdrop-blur sm:p-7">
              {step === 0 ? <GoalQuestion answers={answers} updateAnswers={updateAnswers} /> : null}
              {step === 1 ? (
                <TaskQuestion answers={answers} currentGoal={currentGoal} updateAnswers={updateAnswers} />
              ) : null}
              {step === 2 ? <PreferencesQuestion answers={answers} updateAnswers={updateAnswers} /> : null}
              {step === 3 ? <RequirementsQuestion answers={answers} updateAnswers={updateAnswers} /> : null}

              {error ? <p className="mt-5 type-label-md text-rose-200">{error}</p> : null}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  onClick={() => {
                    if (step === 0) setScreen("intro");
                    else setStep((value) => value - 1);
                  }}
                  type="button"
                  variant="outline"
                >
                  Back
                </Button>
                <Button disabled={!canContinue} onClick={handleNext} type="button">
                  {step === steps.length - 1 ? "See recommendations" : "Continue"}
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {screen === "loading" ? <LoadingScreen /> : null}
        {screen === "results" ? (
          <ResultsScreen
            answers={answers}
            onAdjust={() => {
              setStep(0);
              setScreen("questions");
            }}
            onStartAgain={startAgain}
            recommendations={recommendations}
          />
        ) : null}
      </section>
    </main>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <p className="type-overline text-lime-300">Pluto Guides</p>
        <h1 className="mt-4 type-h1 text-white">AI tool recommendations without the guesswork.</h1>
        <p className="mt-5 max-w-2xl type-body-xl text-white/70">
          Tell Pluto your goal, task, preferences, and requirements. Get up to five ranked tools with reasons you can actually compare.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={onStart} type="button">
            Start guide <Sparkles aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Button asChild variant="outline">
            <Link href="/plutos-library">
              Browse Discover <Search aria-hidden="true" className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="rounded-3xl border border-white/12 bg-white/8 p-5 shadow-card backdrop-blur">
        <div className="grid gap-3">
          {steps.map((item, index) => (
            <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-4" key={item}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/24 type-label-md text-white">
                {index + 1}
              </span>
              <span>
                <span className="block type-label-md text-white">{item}</span>
                <span className="type-body-sm text-white/58">One focused answer, then move on.</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <ol className="mt-8 grid gap-2 sm:grid-cols-4">
      {steps.map((item, index) => (
        <li
          className={cn(
            "rounded-2xl border border-white/12 bg-white/6 px-4 py-3 type-label-md text-white/60",
            index <= step && "border-violet-300/40 bg-violet-500/18 text-white"
          )}
          key={item}
        >
          {index + 1}. {item}
        </li>
      ))}
    </ol>
  );
}

function GoalQuestion({ answers, updateAnswers }: QuestionProps) {
  return (
    <QuestionShell eyebrow="Question 1" title="What is your main goal?">
      <OptionGrid>
        {guideGoals.map((goal) => (
          <OptionButton
            active={answers.goal === goal.id}
            description={goal.description}
            key={goal.id}
            label={goal.label}
            onClick={() => updateAnswers({ goal: goal.id, primaryTask: "", relatedTasks: [] })}
          />
        ))}
      </OptionGrid>
    </QuestionShell>
  );
}

function TaskQuestion({ answers, currentGoal, updateAnswers }: QuestionProps & { currentGoal?: (typeof guideGoals)[number] }) {
  return (
    <QuestionShell eyebrow="Question 2" title="Which task should the tool help with?">
      <OptionGrid>
        {(currentGoal?.tasks ?? []).map((task) => (
          <OptionButton
            active={answers.primaryTask === task.id}
            description={task.description}
            key={task.id}
            label={task.label}
            onClick={() => updateAnswers({ primaryTask: task.id })}
          />
        ))}
      </OptionGrid>
      {answers.primaryTask ? (
        <div className="mt-6">
          <p className="type-label-md text-white/76">Optional related tasks</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(currentGoal?.tasks ?? [])
              .filter((task) => task.id !== answers.primaryTask)
              .map((task) => (
                <ChipToggle
                  active={answers.relatedTasks.includes(task.id)}
                  key={task.id}
                  label={task.label}
                  onClick={() => toggleList(answers.relatedTasks, task.id, (items) => updateAnswers({ relatedTasks: items }), 2)}
                />
              ))}
          </div>
        </div>
      ) : null}
    </QuestionShell>
  );
}

function PreferencesQuestion({ answers, updateAnswers }: QuestionProps) {
  return (
    <QuestionShell eyebrow="Question 3" title="What should Pluto prioritize?">
      <p className="mt-2 type-body-sm text-white/60">Choose up to three. No strong preference clears other choices.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {guidePreferences.map((preference) => (
          <ChipToggle
            active={answers.preferences.includes(preference.id)}
            key={preference.id}
            label={preference.label}
            onClick={() => {
              if (preference.id === "no-strong-preference") {
                updateAnswers({ preferences: [preference.id] });
                return;
              }
              const current = answers.preferences.filter((item) => item !== "no-strong-preference");
              toggleList(current, preference.id, (items) => updateAnswers({ preferences: items }), 3);
            }}
          />
        ))}
      </div>
    </QuestionShell>
  );
}

function RequirementsQuestion({ answers, updateAnswers }: QuestionProps) {
  return (
    <QuestionShell eyebrow="Question 4" title="What requirements matter?">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 type-label-md text-white">
            <WalletCards aria-hidden="true" className="h-5 w-5 text-lime-300" />
            Budget required
          </p>
          <div className="mt-3 grid gap-2">
            {guideBudgets.map((budget) => (
              <OptionButton
                active={answers.budget === budget.id}
                compact
                description={budget.description}
                key={budget.id}
                label={budget.label}
                onClick={() => updateAnswers({ budget: budget.id })}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="type-label-md text-white">Platform optional</p>
          <div className="mt-3 grid gap-2">
            {guidePlatforms.map((platform) => (
              <OptionButton
                active={answers.platform === platform.id}
                compact
                description={platform.description}
                key={platform.label}
                label={platform.label}
                onClick={() => updateAnswers({ platform: platform.id })}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <p className="type-label-md text-white">Optional requirements</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {guideRequirements.map((requirement) => (
            <ChipToggle
              active={answers.requirements.includes(requirement.id)}
              key={requirement.id}
              label={requirement.label}
              onClick={() => toggleList(answers.requirements, requirement.id, (items) => updateAnswers({ requirements: items }))}
            />
          ))}
        </div>
      </div>
    </QuestionShell>
  );
}

function LoadingScreen() {
  return (
    <section className="mx-auto grid min-h-[46vh] max-w-3xl place-items-center text-center">
      <div className="rounded-3xl border border-white/12 bg-white/8 p-8 shadow-card backdrop-blur">
        <Loader2 aria-hidden="true" className="mx-auto h-10 w-10 animate-spin text-lime-300" />
        <h1 className="mt-5 type-h3 text-white">Ranking trusted matches</h1>
        <p className="mt-3 type-body-md text-white/66">
          Pluto is checking task fit, budget, platform, requirements, and verification signals.
        </p>
      </div>
    </section>
  );
}

function ResultsScreen({
  answers,
  onAdjust,
  onStartAgain,
  recommendations
}: {
  answers: GuideAnswers;
  onAdjust: () => void;
  onStartAgain: () => void;
  recommendations: GuideRecommendation[];
}) {
  const addTool = useCompareStore((state) => state.addTool);

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-overline text-lime-300">Pluto Guides</p>
          <h1 className="mt-3 type-h2 text-white">Your recommended tools</h1>
          <p className="mt-3 max-w-2xl type-body-md text-white/68">
            Ranked from the existing Discover library using your four answers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAdjust} type="button" variant="outline">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
            Adjust answers
          </Button>
          <Button onClick={onStartAgain} type="button" variant="outline">
            <RotateCcw aria-hidden="true" className="h-5 w-5" />
            Start over
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[answers.goal, answers.primaryTask, answers.budget, answers.platform].filter(Boolean).map((item) => (
          <span className="rounded-full border border-white/12 bg-white/8 px-3 py-2 type-label-sm text-white/70" key={item}>
            {item}
          </span>
        ))}
      </div>

      {recommendations.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-white/12 bg-white/8 p-8 text-center">
          <h2 className="type-h4 text-white">No confident match yet</h2>
          <p className="mt-3 type-body-md text-white/66">Try loosening budget, platform, or API requirements.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {recommendations.map((recommendation, index) => (
            <ResultCard
              emphasized={index < 3}
              key={recommendation.slug}
              onCompare={() => addTool(recommendation.slug)}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResultCard({
  emphasized,
  onCompare,
  recommendation
}: {
  emphasized: boolean;
  onCompare: () => void;
  recommendation: GuideRecommendation;
}) {
  const toggleSaved = useCompareStore((state) => state.toggleSaved);
  const saved = useCompareStore((state) => state.saved.includes(recommendation.slug));

  return (
    <article
      className={cn(
        "rounded-3xl border bg-white/8 p-5 shadow-card backdrop-blur sm:p-6",
        emphasized ? "border-violet-300/38" : "border-white/12"
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-500/24 px-3 py-1 type-label-sm text-violet-100">{recommendation.fit}</span>
            <span className="rounded-full bg-white/8 px-3 py-1 type-label-sm text-white/64">Score {recommendation.score}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-lime-300/12 px-3 py-1 type-label-sm text-lime-200">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              {recommendation.verification}
            </span>
          </div>
          <h2 className="mt-4 type-h4 text-white">{recommendation.name}</h2>
          <p className="mt-2 max-w-3xl type-body-md text-white/68">{recommendation.shortDescription}</p>
          <div className="mt-4 grid gap-2 type-body-sm text-white/72">
            {recommendation.reasons.map((reason) => (
              <p className="flex gap-2" key={reason}>
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                {reason}
              </p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {recommendation.matchedRequirements.map((item) => (
              <span className="rounded-full border border-white/12 px-3 py-1 type-label-sm text-white/68" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:w-64 lg:grid-cols-1">
          <Button asChild>
            <Link href={recommendation.href}>View details</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={recommendation.officialUrl} rel="noreferrer" target="_blank">
              Visit tool <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </a>
          </Button>
          <Button onClick={onCompare} type="button" variant="outline">
            Add to compare
          </Button>
          <Button onClick={() => toggleSaved(recommendation.slug)} type="button" variant="outline">
            <Heart aria-hidden="true" className={cn("h-5 w-5", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 border-t border-white/12 pt-4 type-body-sm text-white/58 md:grid-cols-3">
        <p>Pricing: {recommendation.pricing}</p>
        <p>Platforms: {recommendation.platforms.join(", ") || "Not listed"}</p>
        <p>API: {recommendation.api}</p>
      </div>
    </article>
  );
}

type QuestionProps = {
  answers: GuideAnswers;
  updateAnswers: (partial: Partial<GuideAnswers>) => void;
};

function QuestionShell({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  return (
    <div>
      <p className="type-overline text-lime-300">{eyebrow}</p>
      <h2 className="mt-2 type-h3 text-white">{title}</h2>
      {children}
    </div>
  );
}

function OptionGrid({ children }: { children: ReactNode }) {
  return <div className="mt-5 grid gap-3 md:grid-cols-2">{children}</div>;
}

function OptionButton({
  active,
  compact,
  description,
  label,
  onClick
}: {
  active: boolean;
  compact?: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "focus-ring rounded-2xl border p-4 text-left transition",
        compact ? "min-h-20" : "min-h-32",
        active
          ? "border-violet-300/70 bg-violet-500/20 text-white"
          : "border-white/12 bg-white/6 text-white/78 hover:border-white/28 hover:bg-white/10"
      )}
      onClick={onClick}
      type="button"
    >
      <span className="block type-label-lg text-white">{label}</span>
      <span className="mt-2 block type-body-sm text-white/58">{description}</span>
    </button>
  );
}

function ChipToggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "focus-ring min-h-11 rounded-full border px-4 type-label-md transition",
        active
          ? "border-lime-300/70 bg-lime-300/14 text-lime-100"
          : "border-white/12 bg-white/6 text-white/70 hover:border-white/28 hover:bg-white/10"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function toggleList(current: string[], id: string, onChange: (items: string[]) => void, max = 99) {
  if (current.includes(id)) {
    onChange(current.filter((item) => item !== id));
    return;
  }
  if (current.length >= max) return;
  onChange([...current, id]);
}


