"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GitCompareArrows, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolLogo } from "@/components/shared/tool-logo";
import { PlutoButton } from "@/components/ui/pluto-button";
import { MAX_COMPARE_TOOLS, useCompareStore } from "@/lib/compare-store";
import { getCompareTool, getValidCompareSlugs } from "@/lib/compare-tools";
import { cn } from "@/lib/utils";
import styles from "./comparison-tray.module.css";

export function ComparisonTray() {
  const pathname = usePathname();
  const selected = useCompareStore((state) => state.selected);
  const hydrated = useCompareStore((state) => state.hydrated);
  const feedback = useCompareStore((state) => state.feedback);
  const removeTool = useCompareStore((state) => state.removeTool);
  const clearCompare = useCompareStore((state) => state.clearCompare);
  const [expanded, setExpanded] = useState(false);
  const validSelected = useMemo(() => getValidCompareSlugs(selected), [selected]);
  const tools = validSelected.map((slug) => getCompareTool(slug)).filter(Boolean);
  const compareHref = `/compare?tools=${validSelected.join(",")}`;

  if (!hydrated || pathname === "/compare" || validSelected.length === 0) {
    return <div className="sr-only" aria-live="polite">{feedback}</div>;
  }

  return (
    <aside className={cn(styles.tray, "comparison-tray-shell", expanded && styles.expanded)} aria-label="Prepared comparison">
      <div className={styles.live} aria-live="polite">{feedback}</div>
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <span className={styles.icon}><GitCompareArrows aria-hidden="true" /></span>
          <span>
            <strong>Compare tools</strong>
            <span>{validSelected.length} of {MAX_COMPARE_TOOLS} selected</span>
          </span>
        </div>
        <button className={styles.expandButton} onClick={() => setExpanded((open) => !open)} type="button" aria-expanded={expanded}>
          <ChevronDown aria-hidden="true" />
          <span className="sr-only">Toggle selected comparison tools</span>
        </button>
      </div>

      <div className={styles.toolRow}>
        {tools.map((tool) => tool ? (
          <span className={styles.toolPill} key={tool.slug}>
            <ToolLogo className={styles.logo} name={tool.name} src={tool.logoUrl} />
            <span className={styles.toolName}>{tool.name}</span>
            <button aria-label={`Remove ${tool.name} from comparison`} onClick={() => removeTool(tool.slug, tool.name)} type="button">
              <X aria-hidden="true" />
            </button>
          </span>
        ) : null)}
        {validSelected.length < MAX_COMPARE_TOOLS ? (
          <Link className={styles.addSlot} href={compareHref}>
            <Plus aria-hidden="true" />
            Add tool
          </Link>
        ) : null}
      </div>

      <div className={styles.actions}>
        <p>{validSelected.length < 2 ? "Add at least one more tool." : validSelected.length === MAX_COMPARE_TOOLS ? "Maximum 4 tools selected." : "Your comparison is ready."}</p>
        <div className={styles.actionButtons}>
          <button className={styles.clearButton} onClick={clearCompare} type="button">Clear all</button>
          {validSelected.length >= 2 ? (
            <PlutoButton className={styles.trayCta} href={compareHref} showArrow size="md" variant="primary">
              Compare now
            </PlutoButton>
          ) : (
            <PlutoButton className={styles.trayCta} disabled showArrow size="md" type="button" variant="primary">
              Compare now
            </PlutoButton>
          )}
        </div>
      </div>
    </aside>
  );
}
