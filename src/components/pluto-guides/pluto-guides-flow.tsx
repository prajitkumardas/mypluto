"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Code2,
  Heart,
  Loader2,
  PenLine,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards
} from "lucide-react";
import { CompareButton } from "@/components/compare/compare-button";
import { Button } from "@/components/ui/button";
import { HeroVeil } from "@/components/shared/hero-veil";
import { useCompareStore } from "@/lib/compare-store";
import {
  emptyGuideAnswers,
  guideBudgets,
  guideGoals,
  guidePlatforms,
  guidePreferences,
  guideRequirements,
  type GuideAnswers,
  type GuideOption,
  type GuideRecommendation,
  type SelectionMode
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
    <main className="relative isolate overflow-hidden bg-canvas text-white">
      <HeroVeil className="h-[32rem] opacity-60" />
      <section className="relative z-10 mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
        {screen === "intro" ? (
          <IntroScreen onStart={() => setScreen("questions")} />
        ) : null}

        {screen === "questions" ? (
          <GuideQuestionScreen
            answers={answers}
            canContinue={canContinue}
            currentGoal={currentGoal}
            error={error}
            onBack={() => {
              if (step === 0) setScreen("intro");
              else setStep((value) => value - 1);
            }}
            onContinue={handleNext}
            onSaveExit={() => setScreen("intro")}
            step={step}
            updateAnswers={updateAnswers}
          />
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
    <section className="mx-auto flex min-h-[31rem] max-w-6xl flex-col items-center justify-center py-8 text-center lg:py-12">
      <p className="type-overline text-lime-300">Pluto Guides</p>
      <h1 className="mt-5 max-w-5xl type-h1 text-white">
        Find the right AI tools - without the guesswork.
      </h1>
      <p className="mt-6 max-w-2xl type-body-lg text-white/72">
        Answer four focused questions. Pluto will rank the best matches from the Discover library and explain why each tool fits.
      </p>

      <ol className="mt-7 grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {steps.map((item, index) => (
          <li className="relative" key={item}>
            {index > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-[calc(100%+0.35rem)] top-1/2 hidden h-px w-7 -translate-y-1/2 bg-gradient-to-r from-transparent via-violet-400/70 to-violet-400/70 lg:block"
              />
            ) : null}
            <span className="flex min-h-12 items-center gap-3 rounded-full border border-white/14 bg-[rgba(29,29,42,0.72)] px-3 pr-5 text-left shadow-[0_12px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[18px]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 type-label-md text-white">
                {index + 1}
              </span>
              <span className="type-label-sm text-white/86">{item}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button className="min-w-40" onClick={onStart} type="button">
          Start guide <Sparkles aria-hidden="true" className="h-5 w-5" />
        </Button>
        <Button asChild className="min-w-40" variant="outline">
          <Link href="/plutos-library">
            Browse Discover <Search aria-hidden="true" className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <p className="mt-5 type-body-sm text-white/48">Takes about 2 minutes - No account required</p>
    </section>
  );
}
function Progress({ step }: { step: number }) {
  const percentComplete = (step + 1) * 25;

  return (
    <div className="mx-auto mt-7 max-w-4xl">
      <div className="flex items-center justify-between type-label-sm text-white/72">
        <span>{`Step ${step + 1} of 4`}</span>
        <span>{`${percentComplete}% complete`}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-[width]"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item, index) => (
          <li
            className={cn(
              "flex min-h-10 items-center justify-center gap-2 type-label-sm text-white/58",
              index === step && "text-white",
              index < step && "text-white/76"
            )}
            key={item}
          >
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70",
                index === step && "bg-violet-500 text-white",
                index < step && "bg-violet-500/55 text-white"
              )}
            >
              {index + 1}
            </span>
            {index === step ? <span className="text-lime-300">|</span> : null}
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function GuideQuestionScreen({
  answers,
  canContinue,
  currentGoal,
  error,
  onBack,
  onContinue,
  onSaveExit,
  step,
  updateAnswers
}: {
  answers: GuideAnswers;
  canContinue: boolean;
  currentGoal?: (typeof guideGoals)[number];
  error: string;
  onBack: () => void;
  onContinue: () => void;
  onSaveExit: () => void;
  step: number;
  updateAnswers: (partial: Partial<GuideAnswers>) => void;
}) {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-4xl text-center">
        <p className="type-overline text-lime-300">Pluto Guides</p>
        <h1 className="mt-3 type-h1 text-white">Let&apos;s find your best-fit AI tools.</h1>
        <p className="mt-3 type-body-md text-white/68">
          Four quick questions. Choose the answer that feels closest - you can adjust it later.
        </p>
      </div>

      <Progress step={step} />

      <div className="mt-7 rounded-[1.35rem] border border-[rgba(255,255,255,0.16)] bg-[rgba(29,29,42,0.72)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[18px] sm:p-7">
        {step === 0 ? <GoalQuestion answers={answers} updateAnswers={updateAnswers} /> : null}
        {step === 1 ? <TaskQuestion answers={answers} currentGoal={currentGoal} updateAnswers={updateAnswers} /> : null}
        {step === 2 ? <PreferencesQuestion answers={answers} updateAnswers={updateAnswers} /> : null}
        {step === 3 ? <RequirementsQuestion answers={answers} updateAnswers={updateAnswers} /> : null}

        {error ? <p className="mt-5 type-label-md text-rose-200">{error}</p> : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3 sm:items-end">
          <Button className="justify-self-start" onClick={onBack} type="button" variant="outline">
            Back
          </Button>
          <button className="justify-self-center type-label-sm text-white/86 transition hover:text-lime-300" onClick={onSaveExit} type="button">
            Save & exit
          </button>
          <div className="grid justify-self-stretch sm:justify-self-end">
            <Button disabled={!canContinue} onClick={onContinue} type="button">
              {step === steps.length - 1 ? "See recommendations" : "Continue"}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Button>
            <span className="mt-2 text-center type-label-sm text-white/38 sm:text-right">Press Enter</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoalQuestion({ answers, updateAnswers }: QuestionProps) {
  return (
    <QuestionShell eyebrow="Question 1" title="What would you mainly like to accomplish?" copy="Choose one primary goal. This helps Pluto narrow the right category first.">
      <GuideOptions
        legend="What would you mainly like to accomplish?"
        minSelections={1}
        name="guide-goal"
        onChange={(value) => updateAnswers({ goal: value as string, primaryTask: "", relatedTasks: [] })}
        options={guideGoals}
        selectionMode="single"
        value={answers.goal}
        iconForOption={(goal) => <GoalIcon goalId={goal.id} />}
      />
    </QuestionShell>
  );
}

function GoalIcon({ goalId }: { goalId: string }) {
  const iconClassName = "h-6 w-6";

  if (goalId === "create-content") return <PenLine aria-hidden="true" className={iconClassName} />;
  if (goalId === "automate-work") return <Settings aria-hidden="true" className={iconClassName} />;
  if (goalId === "research-learn") return <BookOpen aria-hidden="true" className={iconClassName} />;
  if (goalId === "build-products") return <Code2 aria-hidden="true" className={iconClassName} />;

  return <Briefcase aria-hidden="true" className={iconClassName} />;
}

function TaskQuestion({ answers, currentGoal, updateAnswers }: QuestionProps & { currentGoal?: (typeof guideGoals)[number] }) {
  const relatedTasks = (currentGoal?.tasks ?? []).filter((task) => task.id !== answers.primaryTask);

  return (
    <QuestionShell eyebrow="Question 2" title="Which task should the tool help with?" copy="Choose the closest task. Pluto will use this to sharpen the ranking.">
      <GuideOptions
        legend="Which task should the tool help with?"
        minSelections={1}
        name="guide-primary-task"
        onChange={(value) => updateAnswers({ primaryTask: value as string })}
        options={currentGoal?.tasks ?? []}
        selectionMode="single"
        value={answers.primaryTask}
        iconForOption={() => <Settings aria-hidden="true" className="h-5 w-5" />}
      />

      {answers.primaryTask && relatedTasks.length > 0 ? (
        <GuideOptions
          className="mt-6"
          heading="Optional related tasks"
          legend="Optional related tasks"
          maxSelections={2}
          name="guide-related-tasks"
          onChange={(value) => updateAnswers({ relatedTasks: value as string[] })}
          options={relatedTasks}
          selectionMode="multiple"
          value={answers.relatedTasks}
          iconForOption={() => <Sparkles aria-hidden="true" className="h-5 w-5" />}
        />
      ) : null}
    </QuestionShell>
  );
}

function PreferencesQuestion({ answers, updateAnswers }: QuestionProps) {
  return (
    <QuestionShell eyebrow="Question 3" title="What should Pluto prioritize?" copy="Choose up to three priorities. No strong preference clears the others.">
      <GuideOptions
        alwaysEnabledOptionIds={["no-strong-preference"]}
        legend="What should Pluto prioritize?"
        maxSelections={3}
        name="guide-preferences"
        onChange={(value) => {
          const next = value as string[];
          if (next.includes("no-strong-preference") && !answers.preferences.includes("no-strong-preference")) {
            updateAnswers({ preferences: ["no-strong-preference"] });
            return;
          }
          updateAnswers({ preferences: next.filter((item) => item !== "no-strong-preference").slice(0, 3) });
        }}
        options={guidePreferences}
        selectionMode="multiple"
        value={answers.preferences}
        iconForOption={() => <Sparkles aria-hidden="true" className="h-5 w-5" />}
      />
    </QuestionShell>
  );
}

function RequirementsQuestion({ answers, updateAnswers }: QuestionProps) {
  return (
    <QuestionShell eyebrow="Question 4" title="What requirements matter?" copy="Set the budget, platform, and any must-have constraints before Pluto ranks the matches.">
      <GuideOptions
        className="mt-6"
        heading={(
          <span className="inline-flex items-center gap-2">
            <WalletCards aria-hidden="true" className="h-5 w-5 text-lime-300" />
            Budget required
          </span>
        )}
        legend="Budget required"
        minSelections={1}
        name="guide-budget"
        onChange={(value) => updateAnswers({ budget: value as string })}
        options={guideBudgets}
        selectionMode="single"
        value={answers.budget}
        iconForOption={() => <WalletCards aria-hidden="true" className="h-5 w-5" />}
      />

      <GuideOptions
        className="mt-6"
        heading="Platform optional"
        instruction="Choose one option, or keep no platform preference."
        legend="Platform optional"
        name="guide-platform"
        onChange={(value) => updateAnswers({ platform: value as string })}
        options={guidePlatforms}
        selectionMode="single"
        value={answers.platform}
        iconForOption={() => <Search aria-hidden="true" className="h-5 w-5" />}
      />

      <GuideOptions
        className="mt-6"
        heading="Optional requirements"
        legend="Optional requirements"
        name="guide-requirements"
        onChange={(value) => updateAnswers({ requirements: value as string[] })}
        options={guideRequirements}
        selectionMode="multiple"
        value={answers.requirements}
        iconForOption={() => <ShieldCheck aria-hidden="true" className="h-5 w-5" />}
      />
    </QuestionShell>
  );
}

type GuideOptionsProps = {
  alwaysEnabledOptionIds?: string[];
  className?: string;
  heading?: ReactNode;
  iconForOption: (option: GuideOption) => ReactNode;
  instruction?: string;
  legend: string;
  maxSelections?: number;
  minSelections?: number;
  name: string;
  onChange: (value: string | string[]) => void;
  options: GuideOption[];
  selectionMode: SelectionMode;
  value: string | string[];
};

function GuideOptions({
  alwaysEnabledOptionIds = [],
  className,
  heading,
  iconForOption,
  instruction,
  legend,
  maxSelections,
  minSelections,
  name,
  onChange,
  options,
  selectionMode,
  value
}: GuideOptionsProps) {
  const selectedValues = Array.isArray(value) ? value : [value];
  const selectedCount = Array.isArray(value) ? value.length : value ? 1 : 0;
  const hintId = `${name}-hint`;
  const counterId = `${name}-counter`;
  const describedBy = selectionMode === "multiple" && maxSelections ? `${hintId} ${counterId}` : hintId;

  const handleSelect = (optionId: string) => {
    if (selectionMode === "single") {
      onChange(optionId);
      return;
    }

    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter((item) => item !== optionId));
      return;
    }

    if (maxSelections && selectedCount >= maxSelections && !alwaysEnabledOptionIds.includes(optionId)) return;
    onChange([...selectedValues.filter(Boolean), optionId]);
  };

  return (
    <fieldset className={cn("mt-6", className)}>
      <legend className="sr-only">{legend}</legend>
      {heading ? <p className="type-label-md text-white">{heading}</p> : null}
      <div className={cn("flex flex-wrap items-center justify-between gap-2", heading && "mt-3")}>
        <p className="type-label-sm text-lime-200" id={hintId}>
          {instruction ?? getSelectionInstruction(selectionMode, minSelections, maxSelections)}
        </p>
        {selectionMode === "multiple" && maxSelections ? (
          <p className="type-label-sm text-white/48" id={counterId}>
            {selectedCount} of {maxSelections} selected
          </p>
        ) : null}
      </div>
      <div
        aria-describedby={describedBy}
        className="mt-4 grid items-stretch gap-4 md:grid-cols-2"
        role={selectionMode === "single" ? "radiogroup" : undefined}
      >
        {options.map((option) => {
          const selected = selectedValues.includes(option.id);
          const disabled = Boolean(
            selectionMode === "multiple" &&
              maxSelections &&
              selectedCount >= maxSelections &&
              !selected &&
              !alwaysEnabledOptionIds.includes(option.id)
          );

          return (
            <GuideOptionCard
              description={option.description}
              disabled={disabled}
              icon={iconForOption(option)}
              id={option.id}
              key={option.id || "none"}
              name={name}
              onSelect={handleSelect}
              selected={selected}
              selectionMode={selectionMode}
              title={option.label}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

type GuideOptionCardProps = {
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  id: string;
  name: string;
  onSelect: (id: string) => void;
  selected: boolean;
  selectionMode: SelectionMode;
  title: string;
};

function GuideOptionCard({
  description,
  disabled,
  icon,
  id,
  name,
  onSelect,
  selected,
  selectionMode,
  title
}: GuideOptionCardProps) {
  const optionDomId = `${name}-${id || "none"}`;
  const descriptionId = `${optionDomId}-description`;
  const isRadio = selectionMode === "single";

  return (
    <label
      className={cn(
        "group relative flex h-full min-h-24 cursor-pointer items-center gap-5 rounded-[1.125rem] border border-white/14 bg-[rgba(12,12,26,0.55)] px-5 py-4 text-left text-white/82 transition duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-lime-200 hover:-translate-y-0.5 hover:border-violet-300/48 hover:bg-violet-500/12 sm:min-h-28 sm:px-6 sm:py-5",
        selected && "border-lime-300 bg-[linear-gradient(90deg,rgba(183,255,75,0.08),rgba(183,255,75,0.018)),rgba(12,12,26,0.62)] text-white shadow-[0_14px_34px_rgba(183,255,75,0.08)]",
        disabled && "cursor-not-allowed opacity-50 hover:translate-y-0 hover:border-white/14 hover:bg-[rgba(12,12,26,0.55)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      )}
      data-selected={selected}
      data-disabled={disabled ? "true" : undefined}
      htmlFor={optionDomId}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/6 text-violet-300 transition duration-200 group-hover:border-white/18 group-hover:text-violet-100 sm:h-11 sm:w-11",
          selected && "border-lime-300/35 bg-lime-300/10 text-lime-200",
          disabled && "group-hover:border-white/10 group-hover:text-violet-300"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[18px] font-semibold leading-[1.3] text-white">{title}</span>
        <span className="mt-1 line-clamp-2 block text-[15px] leading-[1.45] text-white/62" id={descriptionId}>
          {description}
        </span>
      </span>
      <span className="relative grid h-11 w-11 shrink-0 place-items-center">
        <input
          aria-describedby={descriptionId}
          checked={selected}
          className={cn(
            "peer h-8 w-8 cursor-pointer appearance-none border border-white/34 bg-transparent transition duration-200 checked:border-lime-300 checked:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 disabled:cursor-not-allowed",
            isRadio ? "rounded-full" : "rounded-md"
          )}
          disabled={disabled}
          id={optionDomId}
          name={name}
          onChange={() => onSelect(id)}
          type={isRadio ? "radio" : "checkbox"}
          value={id}
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute h-4 w-4 text-ink-950 opacity-0 transition peer-checked:opacity-100"
        />
      </span>
    </label>
  );
}

function getSelectionInstruction(selectionMode: SelectionMode, minSelections?: number, maxSelections?: number) {
  if (selectionMode === "single") return "Choose one option.";
  if (minSelections && maxSelections && minSelections !== maxSelections) return `Select ${minSelections}-${maxSelections} options.`;
  if (minSelections && maxSelections && minSelections === maxSelections) return `Choose ${minSelections} options.`;
  if (maxSelections) return `Select up to ${maxSelections} options.`;
  if (minSelections && minSelections > 1) return `Choose at least ${minSelections} options.`;
  if (minSelections === 1) return "Select at least one option.";

  return "Select all that apply.";
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
recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResultCard({
  emphasized,  recommendation
}: {
  emphasized: boolean;
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
          <CompareButton toolName={recommendation.name} toolSlug={recommendation.slug} type="button" variant="outline" />
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

function QuestionShell({ children, copy, eyebrow, title }: { children: ReactNode; copy: string; eyebrow: string; title: string }) {
  return (
    <div>
      <p className="type-overline text-lime-300">{eyebrow}</p>
      <h2 className="mt-2 type-h3 text-white">{title}</h2>
      <p className="mt-2 type-body-sm text-white/62">{copy}</p>
      {children}
    </div>
  );
}

