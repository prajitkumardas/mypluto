"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Copy, ExternalLink, Flag, Share2, X } from "lucide-react";
import { useState } from "react";
import { CompareButton } from "@/components/compare/compare-button";
import { Button } from "@/components/ui/button";
import styles from "./tool-detail-view.module.css";

type ToolDetailActionsProps = {
  officialUrl: string;
  toolName: string;
  toolSlug: string;
};

const reportReasons = [
  "Incorrect pricing",
  "Broken official website",
  "Outdated features",
  "Wrong logo",
  "Other issue"
];

export function ToolDetailActions({ officialUrl, toolName, toolSlug }: ToolDetailActionsProps) {
  const [shareLabel, setShareLabel] = useState("Share");
  const [reportOpen, setReportOpen] = useState(false);

  const sharePage = async () => {
    const href = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${toolName} on PlutoFinds`, url: href }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(href).catch(() => undefined);
    setShareLabel("Copied");
    window.setTimeout(() => setShareLabel("Share"), 1800);
  };

  return (
    <>
      <div className={styles.heroActions} aria-label={`${toolName} actions`}>
        <Button asChild className={styles.primaryAction} size="lg">
          <a aria-label={`Open ${toolName}'s official website`} href={officialUrl} rel="noreferrer" target="_blank">
            Visit official site <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        </Button>
        <CompareButton className={styles.secondaryAction} selectedLabel="Added" size="lg" toolName={toolName} toolSlug={toolSlug} variant="outline" />
        <Button className={styles.secondaryAction} onClick={sharePage} size="lg" type="button" variant="outline">
          {shareLabel === "Share" ? <Share2 aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
          {shareLabel}
        </Button>
        <div className="sr-only" aria-live="polite">{shareLabel === "Copied" ? `${toolName} link copied.` : ""}</div>
      </div>

      <button className={styles.reportLink} onClick={() => setReportOpen(true)} type="button">
        <Flag aria-hidden="true" /> Report incorrect information
      </button>

      <Dialog.Root open={reportOpen} onOpenChange={setReportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent}>
            <div className={styles.dialogHeader}>
              <div>
                <Dialog.Title>Report incorrect information</Dialog.Title>
                <Dialog.Description>Tell PlutoFinds what should be checked for {toolName}.</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className={styles.dialogClose} aria-label="Close report dialog" type="button">
                  <X aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
            <form className={styles.reportForm} onSubmit={(event) => { event.preventDefault(); setReportOpen(false); }}>
              <input name="toolSlug" type="hidden" value={toolSlug} />
              <label>
                <span>Issue type</span>
                <select name="reason" defaultValue={reportReasons[0]}>
                  {reportReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                </select>
              </label>
              <label>
                <span>What should we verify?</span>
                <textarea name="details" rows={4} placeholder="Add a short note for the PlutoFinds verification queue." />
              </label>
              <div className={styles.dialogActions}>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost">Cancel</Button>
                </Dialog.Close>
                <Button type="submit">Submit report</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}