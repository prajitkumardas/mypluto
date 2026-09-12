"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Check, CheckCircle2, FileCheck2, Fingerprint, LockKeyhole, Mail, PawPrint, RotateCcw, Search, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PlutoButton } from "@/components/ui/pluto-button";
import { ToolLogo } from "@/components/shared/tool-logo";
import { getFaviconLogoUrl } from "@/lib/tool-logo";
import { readLocalRecord, removeLocalRecord, writeLocalRecord } from "@/lib/local-persistence";
import { cn } from "@/lib/utils";
import { SubmissionField, SubmissionSelect, StepHeading } from "./submission-controls";
import { SubmissionStepper } from "./submission-stepper";
import { SUBMIT_TOOL_OPEN_EVENT } from "./submit-tool-events";
import { emptySubmissionDraft, platformOptions, pricingModels, relationshipOptions, type DuplicateTool, type SubmissionCategory, type SubmissionStage, type ToolSubmissionDraft } from "./types";
import { normalizeDomain, normalizeOfficialUrl, validateIdentity, validateProduct, validateSubmitter } from "./validation";
import styles from "./submit-tool-modal.module.css";

const DRAFT_KEY = "pluto-tool-submission-draft";
const DRAFT_VERSION = 1;
type StoredDraft = { draft: ToolSubmissionDraft; stage: SubmissionStage; timestamp: string };

export function SubmitToolModal({ categories }: { categories: SubmissionCategory[] }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<SubmissionStage>("intro");
  const [draft, setDraft] = useState<ToolSubmissionDraft>(emptySubmissionDraft);
  const [savedDraft, setSavedDraft] = useState<StoredDraft | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateTool | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [direction, setDirection] = useState(1);
  const triggerRef = useRef<HTMLElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);
  const directOpenHandledRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const busy = stage === "checking" || stage === "submitting";
  const stepIndex = getStepIndex(stage);

  const openModal = useCallback(() => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const saved = readLocalRecord<StoredDraft>(DRAFT_KEY, DRAFT_VERSION);
    setSavedDraft(saved && hasMeaningfulDraft(saved.draft) ? saved : null);
    setStage(saved && hasMeaningfulDraft(saved.draft) ? "resume" : "intro");
    setRequestError("");
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(SUBMIT_TOOL_OPEN_EVENT, openModal);
    return () => window.removeEventListener(SUBMIT_TOOL_OPEN_EVENT, openModal);
  }, [openModal]);

  useEffect(() => {
    if (searchParams.get("submit-tool") !== "open" || directOpenHandledRef.current) return;
    directOpenHandledRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      openModal();
      window.history.replaceState(window.history.state, "", pathname);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openModal, pathname, searchParams]);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    if (!open || !hasMeaningfulDraft(draft) || stage === "intro" || stage === "resume" || stage === "success") return;
    writeLocalRecord<StoredDraft>(DRAFT_KEY, DRAFT_VERSION, { draft, stage: persistableStage(stage), timestamp: new Date().toISOString() });
  }, [draft, open, stage]);

  const updateDraft = <K extends keyof ToolSubmissionDraft>(key: K, value: ToolSubmissionDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value, ...(key === "toolName" || key === "officialUrl" ? { duplicateOverride: false } : {}) }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const go = (next: SubmissionStage, nextDirection = 1) => {
    setDirection(nextDirection);
    setStage(next);
  };

  const checkDuplicate = async () => {
    const identityErrors = validateIdentity(draft);
    if (Object.keys(identityErrors).length) { setErrors(identityErrors); return; }
    const officialUrl = normalizeOfficialUrl(draft.officialUrl)!;
    const nextDraft = { ...draft, toolName: draft.toolName.trim(), officialUrl };
    setRequestError("");
    setDraft(nextDraft);
    go("checking");
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const [response] = await Promise.all([
        fetch("/api/submit-tool/duplicate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ toolName: nextDraft.toolName, officialUrl }), signal: controller.signal }),
        new Promise((resolve) => window.setTimeout(resolve, 650))
      ]);
      if (!response.ok) throw new Error("duplicate-check");
      const data = await response.json() as { duplicate?: DuplicateTool | null };
      setDuplicate(data.duplicate ?? null);
      go("duplicate");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setRequestError("We couldn't complete the duplicate check. Try again.");
      go("duplicate");
    }
  };

  const submit = async () => {
    if (!draft.confirmed || submittingRef.current) return;
    submittingRef.current = true;
    setRequestError("");
    go("submitting");
    try {
      const response = await fetch("/api/submit-tool", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...draft, websiteField: "" }) });
      const data = await response.json() as { error?: string; referenceCode?: string };
      if (!response.ok || !data.referenceCode) throw new Error(data.error || "submission");
      removeLocalRecord(DRAFT_KEY);
      setReferenceCode(data.referenceCode);
      go("success");
    } catch (error) {
      setRequestError(error instanceof Error && error.message !== "submission" ? error.message : "We couldn't submit the tool. Please try again.");
      go("review", -1);
    } finally {
      submittingRef.current = false;
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && busy) return;
    setOpen(nextOpen);
    if (!nextOpen) window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const startOver = () => {
    removeLocalRecord(DRAFT_KEY);
    setDraft(emptySubmissionDraft);
    setDuplicate(null);
    setSavedDraft(null);
    setErrors({});
    go("identity");
  };

  const closeAndNavigate = (href: string) => {
    setOpen(false);
    router.push(href, { scroll: true });
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
  };

  const content = renderStage();

  function renderStage() {
    if (stage === "intro") return <Intro onStart={() => go("identity")} />;
    if (stage === "resume") return <Resume onContinue={() => { if (savedDraft) { setDraft(savedDraft.draft); go(persistableStage(savedDraft.stage)); } }} onStartOver={startOver} />;
    if (stage === "identity") return <StepFrame icon={<Fingerprint />} title="Tool identity" copy="Let's start with the basics." back={() => go("intro", -1)} next={checkDuplicate}><div className={styles.fieldStack}><SubmissionField autoFocus error={errors.toolName} label="Tool name *" name="toolName" onChange={(value) => updateDraft("toolName", value)} placeholder="Example: Pluto Studio" value={draft.toolName} /><SubmissionField error={errors.officialUrl} inputMode="url" label="Official website URL *" name="officialUrl" onChange={(value) => updateDraft("officialUrl", value)} placeholder="https://example.com" type="url" value={draft.officialUrl} /></div></StepFrame>;
    if (stage === "checking") return <Checking />;
    if (stage === "duplicate") return <DuplicateResult duplicate={duplicate} error={requestError} onBack={() => go("identity", -1)} onContinue={() => { updateDraft("duplicateOverride", Boolean(duplicate)); go("product"); }} onRetry={checkDuplicate} onView={(slug) => closeAndNavigate(`/plutos-library/tool/${slug}`)} />;
    if (stage === "product") return <ProductStep categories={categories} draft={draft} errors={errors} update={updateDraft} onBack={() => go("duplicate", -1)} onContinue={() => { const nextErrors = validateProduct(draft); if (Object.keys(nextErrors).length) setErrors(nextErrors); else go("submitter"); }} />;
    if (stage === "submitter") return <SubmitterStep draft={draft} errors={errors} update={updateDraft} onBack={() => go("product", -1)} onContinue={() => { const nextErrors = validateSubmitter(draft); if (Object.keys(nextErrors).length) setErrors(nextErrors); else go("review"); }} />;
    if (stage === "review" || stage === "submitting") return <ReviewStep draft={draft} error={requestError} submitting={stage === "submitting"} edit={(next) => go(next, -1)} onBack={() => go("submitter", -1)} onSubmit={submit} update={updateDraft} />;
    return <Success referenceCode={referenceCode} navigate={closeAndNavigate} />;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={cn(styles.modal, (stage === "intro" || stage === "success") && styles.mascotModal)} onEscapeKeyDown={(event) => busy && event.preventDefault()} onInteractOutside={(event) => busy && event.preventDefault()}>
          {!busy && stage !== "success" ? <Dialog.Close asChild><button aria-label="Close submission" className={styles.closeButton} type="button"><X /></button></Dialog.Close> : null}
          {stepIndex >= 0 ? <SubmissionStepper current={stepIndex} /> : null}
          <div className={styles.contentViewport}>
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div animate={{ opacity: 1, x: 0 }} className={styles.animatedContent} custom={direction} exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -18 }} initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 18 }} key={stage} transition={{ duration: reduceMotion ? 0.01 : 0.26, ease: [0.22, 1, 0.36, 1] }}>
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return <div className={styles.intro}><Mascot /><Dialog.Title>Submit an AI tool<br />for verification.</Dialog.Title><Dialog.Description>Know a great AI tool?<br />Help Pluto add it to the galaxy.</Dialog.Description><div className={styles.reassurance}><span><LockKeyhole />No account required</span><span><Sparkles />Quick submission</span><span><Users />Helps the community</span></div><PlutoButton onClick={onStart} showArrow size="lg" type="button" variant="primary">Let&apos;s submit</PlutoButton></div>;
}

function Resume({ onContinue, onStartOver }: { onContinue: () => void; onStartOver: () => void }) {
  return <div className={styles.centerState}><span className={styles.largeIcon}><RotateCcw /></span><Dialog.Title>Continue your submission?</Dialog.Title><Dialog.Description>Pluto saved your progress on this device.</Dialog.Description><div className={styles.centerActions}><PlutoButton onClick={onContinue} showArrow type="button">Continue draft</PlutoButton><PlutoButton onClick={onStartOver} type="button" variant="secondary">Start over</PlutoButton></div></div>;
}

function Mascot() {
  return (
    <div className={styles.mascot} aria-hidden="true">
      <Image
        alt=""
        className={styles.mascotImage}
        height={1321}
        priority
        sizes="(max-width: 700px) 105px, 136px"
        src="/images/play/plutopopup.webp"
        width={1191}
      />
    </div>
  );
}

function StepFrame({ back, children, copy, icon, next, nextLabel = "Continue", title }: { back: () => void; children: ReactNode; copy: string; icon: ReactNode; next: () => void; nextLabel?: string; title: string }) {
  return <div className={styles.step}><StepHeading icon={icon} title={title} copy={copy} />{children}<StepActions back={back} next={next} nextLabel={nextLabel} /></div>;
}

function StepActions({ back, next, nextLabel = "Continue" }: { back: () => void; next: () => void; nextLabel?: string }) {
  return <div className={styles.stepActions}><PlutoButton onClick={back} type="button" variant="secondary">Back</PlutoButton><PlutoButton onClick={next} showArrow type="button" variant="primary">{nextLabel}</PlutoButton></div>;
}

function Checking() { return <div className={styles.centerState}><div className={styles.scanner} aria-hidden="true"><PawPrint /><Search /><i /><i /><i /></div><Dialog.Title>Checking for duplicates…</Dialog.Title><Dialog.Description>We&apos;re making sure this tool isn&apos;t already listed.</Dialog.Description><p className={styles.supporting}>Scanning Pluto&apos;s AI tool library… This usually takes a few seconds.</p></div>; }

function DuplicateResult({ duplicate, error, onBack, onContinue, onRetry, onView }: { duplicate: DuplicateTool | null; error: string; onBack: () => void; onContinue: () => void; onRetry: () => void; onView: (slug: string) => void }) {
  if (error) return <div className={styles.centerState}><span className={cn(styles.largeIcon, styles.warning)}><AlertTriangle /></span><Dialog.Title>Duplicate check paused</Dialog.Title><Dialog.Description>{error}</Dialog.Description><div className={styles.centerActions}><PlutoButton onClick={onBack} type="button" variant="secondary">Back</PlutoButton><PlutoButton onClick={onRetry} type="button">Try again</PlutoButton></div></div>;
  if (!duplicate) return <div className={styles.centerState}><span className={cn(styles.largeIcon, styles.success)}><CheckCircle2 /></span><Dialog.Title>No duplicate detected!</Dialog.Title><Dialog.Description>Looks good. Let&apos;s add the product details.</Dialog.Description><StepActions back={onBack} next={onContinue} /></div>;
  return <div className={styles.centerState}><span className={cn(styles.largeIcon, styles.warning)}><AlertTriangle /></span><Dialog.Title>Looks like Pluto already knows this tool.</Dialog.Title><Dialog.Description>We found a {duplicate.confidence === "domain" ? "matching official domain" : "matching tool name"}.</Dialog.Description><div className={styles.duplicateCard}><ToolLogo className={styles.previewLogo} name={duplicate.name} src={getFaviconLogoUrl(duplicate.domain)} /><div><strong>{duplicate.name}</strong><span>{duplicate.domain}</span></div></div><div className={styles.centerActions}>{duplicate.slug ? <PlutoButton onClick={() => onView(duplicate.slug!)} showArrow type="button">View existing tool</PlutoButton> : null}<PlutoButton onClick={onContinue} type="button" variant={duplicate.slug ? "secondary" : "primary"}>This is a different tool</PlutoButton><PlutoButton onClick={onBack} type="button" variant="secondary">Back</PlutoButton></div></div>;
}

function ProductStep({ categories, draft, errors, onBack, onContinue, update }: { categories: SubmissionCategory[]; draft: ToolSubmissionDraft; errors: Record<string, string>; onBack: () => void; onContinue: () => void; update: <K extends keyof ToolSubmissionDraft>(key: K, value: ToolSubmissionDraft[K]) => void }) {
  return <div className={styles.step}><StepHeading icon={<FileCheck2 />} title="Product details" copy="Share a few details about the tool." /><div className={styles.fieldStack}><SubmissionField error={errors.tagline} label="Tagline *" name="tagline" onChange={(value) => update("tagline", value)} placeholder="A short product promise" value={draft.tagline} /><div className={styles.twoColumns}><SubmissionSelect error={errors.primaryCategory} label="Primary category *" name="category" onChange={(value) => update("primaryCategory", value)} options={categories.map((item) => ({ label: item.name, value: item.slug }))} placeholder="Select category" value={draft.primaryCategory} /><SubmissionSelect error={errors.pricingModel} label="Pricing model *" name="pricing" onChange={(value) => update("pricingModel", value)} options={pricingModels} placeholder="Select model" value={draft.pricingModel} /></div><fieldset className={styles.platforms}><legend>Platforms <span>Optional</span></legend><div>{platformOptions.map((platform) => <button aria-pressed={draft.platforms.includes(platform)} key={platform} onClick={() => update("platforms", draft.platforms.includes(platform) ? draft.platforms.filter((item) => item !== platform) : [...draft.platforms, platform])} type="button">{draft.platforms.includes(platform) ? <Check /> : null}{platform}</button>)}</div></fieldset></div><StepActions back={onBack} next={onContinue} /></div>;
}

function SubmitterStep({ draft, errors, onBack, onContinue, update }: { draft: ToolSubmissionDraft; errors: Record<string, string>; onBack: () => void; onContinue: () => void; update: <K extends keyof ToolSubmissionDraft>(key: K, value: ToolSubmissionDraft[K]) => void }) {
  return <div className={styles.step}><StepHeading icon={<Mail />} title="Submitter info" copy="A few details so we can reach you if needed." /><div className={styles.twoColumns}><SubmissionField error={errors.submitterEmail} inputMode="email" label="Your email *" name="email" onChange={(value) => update("submitterEmail", value)} placeholder="you@example.com" type="email" value={draft.submitterEmail} /><SubmissionSelect label="Relationship to product" name="relationship" onChange={(value) => update("relationship", value)} options={relationshipOptions} placeholder="Select relationship" value={draft.relationship} /></div><p className={styles.privacyNote}><LockKeyhole />We&apos;ll only use this for verification if needed.</p><StepActions back={onBack} next={onContinue} /></div>;
}

function ReviewStep({ draft, edit, error, onBack, onSubmit, submitting, update }: { draft: ToolSubmissionDraft; edit: (stage: SubmissionStage) => void; error: string; onBack: () => void; onSubmit: () => void; submitting: boolean; update: <K extends keyof ToolSubmissionDraft>(key: K, value: ToolSubmissionDraft[K]) => void }) {
  const domain = normalizeDomain(draft.officialUrl);
  return <div className={styles.step}><StepHeading icon={<ShieldCheck />} title="Review & submit" copy="Please confirm the details before submitting." /><div className={styles.previewCard}><ToolLogo className={styles.previewLogo} name={draft.toolName} src={getFaviconLogoUrl(domain)} /><div className={styles.previewMain}><strong>{draft.toolName}</strong><span>{domain}</span><p>{draft.tagline}</p><div>{[draft.primaryCategory, draft.pricingModel, ...draft.platforms].filter(Boolean).map((item) => <em key={item}>{item}</em>)}</div></div><div className={styles.editButtons}><button onClick={() => edit("identity")} type="button">Edit identity</button><button onClick={() => edit("product")} type="button">Edit details</button></div></div><label className={styles.confirmation}><input checked={draft.confirmed} onChange={(event) => update("confirmed", event.target.checked)} type="checkbox" /><span aria-hidden="true"><Check /></span><span>I confirm this information is accurate to the best of my knowledge.</span></label>{error ? <p className={styles.requestError} role="alert"><AlertTriangle />{error}</p> : null}<div className={styles.stepActions}><PlutoButton disabled={submitting} onClick={onBack} type="button" variant="secondary">Back</PlutoButton><PlutoButton disabled={!draft.confirmed} loading={submitting} onClick={onSubmit} showArrow type="button">{submitting ? "Submitting…" : "Submit for review"}</PlutoButton></div></div>;
}

function Success({ navigate, referenceCode }: { navigate: (href: string) => void; referenceCode: string }) {
  return <div className={styles.successState}><Mascot /><p className={styles.playful}>Thanks for contributing!</p><span className={cn(styles.largeIcon, styles.success)}><CheckCircle2 /></span><p className={styles.status}>Submission received</p><Dialog.Title>Your tool has been submitted for review.</Dialog.Title><Dialog.Description>Pluto will verify the official website, pricing and key features before publication.</Dialog.Description><code>{referenceCode}</code><div className={styles.centerActions}><PlutoButton onClick={() => navigate("/")} type="button">Return home</PlutoButton><PlutoButton onClick={() => navigate("/plutos-library")} type="button" variant="secondary">Discover similar tools</PlutoButton></div></div>;
}

function getStepIndex(stage: SubmissionStage) { if (stage === "identity") return 0; if (stage === "checking" || stage === "duplicate") return 1; if (stage === "product") return 2; if (stage === "submitter") return 3; if (stage === "review" || stage === "submitting") return 4; return -1; }
function persistableStage(stage: SubmissionStage): SubmissionStage { return stage === "checking" || stage === "duplicate" ? "identity" : stage === "submitting" ? "review" : stage; }
function hasMeaningfulDraft(draft: ToolSubmissionDraft) { return Boolean(draft.toolName.trim() || draft.officialUrl.trim() || draft.tagline.trim() || draft.submitterEmail.trim()); }
