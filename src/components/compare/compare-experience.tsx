"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, Loader2, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlutoButton } from "@/components/ui/pluto-button";
import { HeroVeil } from "@/components/shared/hero-veil";
import { ToolLogo } from "@/components/shared/tool-logo";
import { MAX_COMPARE_TOOLS, type RecentToolRecord, useCompareStore } from "@/lib/compare-store";
import { compareTools, getCompareTool, getValidCompareSlugs, searchCompareTools, type CompareTool } from "@/lib/compare-tools";
import styles from "./compare-experience.module.css";

type SelectorState =
  | { mode: "add"; slotIndex: number; oldSlug?: undefined }
  | { mode: "replace"; slotIndex: number; oldSlug: string };

const categories = ["All categories", ...Array.from(new Set(compareTools.map((tool) => tool.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))];

const rows = [
  ["Best for", "bestFor"],
  ["Key features", "features"],
  ["Pricing", "startingPrice"],
  ["Free plan", "freePlan"],
  ["Integrations", "integrations"],
  ["Platforms", "platforms"],
  ["Ease of use", "chips"],
  ["Data privacy", "dataPrivacy"],
  ["Trust or verification", "trust"],
  ["User rating", "userRating"],
  ["Primary category", "category"],
  ["Similar use cases", "similarUseCases"]
] as const;

export function CompareExperience() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = useCompareStore((state) => state.selected);
  const hydrated = useCompareStore((state) => state.hydrated);
  const feedback = useCompareStore((state) => state.feedback);
  const setSelectedTools = useCompareStore((state) => state.setSelectedTools);
  const clearCompare = useCompareStore((state) => state.clearCompare);
  const removeTool = useCompareStore((state) => state.removeTool);
  const replaceTool = useCompareStore((state) => state.replaceTool);
  const addTool = useCompareStore((state) => state.addTool);
  const setFeedback = useCompareStore((state) => state.setFeedback);
  const recentlyViewed = useCompareStore((state) => state.recentlyViewed);
  const [selector, setSelector] = useState<SelectorState | null>(null);
  const seededFromUrlRef = useRef(false);
  const pendingUrlSeedRef = useRef<string | null>(null);
  const [hasCompared, setHasCompared] = useState(false);
  const [copied, setCopied] = useState(false);
  const validSlugs = useMemo(() => getValidCompareSlugs(selected), [selected]);
  const selectedTools = useMemo(() => validSlugs.map((slug) => getCompareTool(slug)).filter(Boolean) as CompareTool[], [validSlugs]);
  const compareReady = selectedTools.length >= 2;
  const compareUrl = `${pathname}${validSlugs.length > 0 ? `?tools=${validSlugs.join(",")}` : ""}`;

  useEffect(() => {
    if (!hydrated || seededFromUrlRef.current) return;

    seededFromUrlRef.current = true;
    const fromUrl = getValidCompareSlugs((searchParams.get("tools") || "").split(","));
    if (fromUrl.length > 0 && fromUrl.join(",") !== validSlugs.join(",")) {
      pendingUrlSeedRef.current = fromUrl.join(",");
      setSelectedTools(fromUrl);
      return;
    }

    if (validSlugs.length !== selected.length) {
      setSelectedTools(validSlugs);
    }
  }, [hydrated, searchParams, selected.length, setSelectedTools, validSlugs]);

  useEffect(() => {
    if (!hydrated || !seededFromUrlRef.current) return;

    const current = searchParams.get("tools") || "";
    const next = validSlugs.join(",");
    if (pendingUrlSeedRef.current) {
      if (next !== pendingUrlSeedRef.current) return;
      pendingUrlSeedRef.current = null;
    }
    if (current === next) return;

    router.replace(next ? `${pathname}?tools=${next}` : pathname, { scroll: false });
  }, [hydrated, pathname, router, searchParams, validSlugs]);

  const handleClear = () => {
    clearCompare();
    setHasCompared(false);
  };

  const handleRemoveTool = (tool: CompareTool) => {
    removeTool(tool.slug, tool.name);
    if (selectedTools.length <= 2) setHasCompared(false);
  };

  const shareComparison = async () => {
    if (!compareReady) return;
    const href = `${window.location.origin}${compareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Pluto Finds comparison", text: "Compare these AI tools with Pluto.", url: href });
        setFeedback("Comparison shared.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard?.writeText(href).catch(() => undefined);
    setCopied(true);
    setFeedback("Comparison link copied.");
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <main className={styles.page}>
      <HeroVeil className={styles.background} />
      <section className={styles.shell}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>COMPARE AI TOOLS</p>
          <h1 className={styles.title}>Compare tools. Choose with confidence.</h1>
          <p className={styles.copy}>Review features, pricing and strengths side by side&mdash;up to four tools.</p>
        </div>

        <section className={styles.builder} aria-labelledby="comparison-builder-title">
          <div className={styles.builderHeader}>
            <div>
              <h2 id="comparison-builder-title">Your comparison</h2>
              <p>{selectedTools.length} of {MAX_COMPARE_TOOLS} selected</p>
            </div>
            <p className={styles.guidance}>{selectedTools.length === 0 ? "Choose at least two tools to begin." : compareReady ? "Ready to compare. You can still add or replace tools." : "Add at least one more tool."}</p>
          </div>

          {!hydrated ? <BuilderSkeleton /> : null}

          {hydrated ? (
            <div className={styles.slots}>
              {Array.from({ length: MAX_COMPARE_TOOLS }).map((_, index) => {
                const tool = selectedTools[index];
                return tool ? (
                  <SelectedSlot
                    key={tool.slug}
                    onRemove={() => handleRemoveTool(tool)}
                    onReplace={() => setSelector({ mode: "replace", oldSlug: tool.slug, slotIndex: index })}
                    tool={tool}
                  />
                ) : (
                  <EmptySlot key={`empty-${index}`} onSelect={() => setSelector({ mode: "add", slotIndex: index })} />
                );
              })}
            </div>
          ) : null}

          <div className={styles.actions}>
            <PlutoButton disabled={!compareReady} onClick={() => setHasCompared(true)} showArrow size="lg" type="button" variant="primary">
              Compare tools
            </PlutoButton>
            <PlutoButton disabled={selectedTools.length === 0} onClick={handleClear} size="lg" type="button" variant="secondary">
              Clear all
            </PlutoButton>
            {compareReady ? (
              <PlutoButton onClick={shareComparison} size="lg" type="button" variant="secondary">
                <Copy aria-hidden="true" className="h-4 w-4" />
                {copied ? "Copied" : "Share comparison"}
              </PlutoButton>
            ) : null}
          </div>
          <div className="sr-only" aria-live="polite">{feedback}</div>
        </section>

        {compareReady && hasCompared ? (
          <>
            <PlutoInsight tools={selectedTools} />
            <ComparisonMatrix tools={selectedTools} />
          </>
        ) : (
          <RecommendedTools selectedSlugs={validSlugs} onOpenSelector={() => setSelector({ mode: "add", slotIndex: selectedTools.length })} />
        )}
      </section>

      <ToolSelector
        recentlyViewed={recentlyViewed}
        selectedSlugs={validSlugs}
        selector={selector}
        onClose={() => setSelector(null)}
        onSelect={(tool) => {
          if (!selector) return;
          const result = selector.mode === "replace"
            ? replaceTool(selector.oldSlug, tool.slug, tool.name)
            : addTool(tool.slug, tool.name);
          if (result.status === "added") {
            setSelector(null);
            setHasCompared((current) => current && result.selected.length >= 2);
          }
        }}
      />
    </main>
  );
}

function BuilderSkeleton() {
  return (
    <div className={styles.slots} aria-label="Restoring saved comparison">
      {Array.from({ length: MAX_COMPARE_TOOLS }).map((_, index) => (
        <div className={styles.skeletonSlot} key={index}>
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          Restoring saved selections
        </div>
      ))}
    </div>
  );
}

function EmptySlot({ onSelect }: { onSelect: () => void }) {
  return (
    <button className={styles.emptySlot} onClick={onSelect} type="button">
      <Plus aria-hidden="true" />
      <span>Add a tool</span>
      <small>Search the Pluto library</small>
    </button>
  );
}

function SelectedSlot({ onRemove, onReplace, tool }: { onRemove: () => void; onReplace: () => void; tool: CompareTool }) {
  return (
    <article className={styles.selectedSlot}>
      <button aria-label={`Remove ${tool.name} from comparison`} className={styles.removeSlot} onClick={onRemove} type="button">
        <X aria-hidden="true" />
      </button>
      <ToolLogo className={styles.slotLogo} name={tool.name} src={tool.logoUrl} />
      <div className={styles.slotCopy}>
        <h3>{tool.name}</h3>
        <p>{tool.category}</p>
        <span>{tool.pricing || "Pricing not verified"}</span>
      </div>
      <button className={styles.changeButton} onClick={onReplace} type="button">Change tool</button>
    </article>
  );
}

function PlutoInsight({ tools }: { tools: CompareTool[] }) {
  const verifiedCount = tools.filter((tool) => /verified/i.test(tool.verification)).length;
  const message = verifiedCount === tools.length
    ? "Each tool is strong in a different context. Focus on what matches your workflow."
    : "Some details are not fully verified. Use this comparison as a shortlist, then confirm critical claims on official sites.";

  return (
    <section className={styles.insight}>
      <span className={styles.plutoMark}>P</span>
      <div>
        <h2>Pluto&apos;s insight</h2>
        <p>{message}</p>
      </div>
    </section>
  );
}

function ComparisonMatrix({ tools }: { tools: CompareTool[] }) {
  return (
    <section className={styles.matrixShell} aria-labelledby="comparison-matrix-title">
      <h2 className="sr-only" id="comparison-matrix-title">Comparison details</h2>
      <div className={styles.matrixScroll}>
        <table className={styles.matrix} style={{ minWidth: `${13 + tools.length * 17}rem` }}>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {tools.map((tool) => (
                <th key={tool.slug} scope="col">
                  <span className={styles.matrixToolHead}>
                    <ToolLogo className={styles.matrixLogo} name={tool.name} src={tool.logoUrl} />
                    <span>{tool.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, field]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {tools.map((tool) => (
                  <td key={`${tool.slug}-${field}`}>{formatMatrixValue(tool, field)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatMatrixValue(tool: CompareTool, field: (typeof rows)[number][1]) {
  const value = tool[field];

  if (Array.isArray(value)) {
    if (value.length === 0) return "Not available";
    if (field === "chips") {
      return <span className={styles.chips}>{value.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</span>;
    }
    return <span className={styles.listValue}>{value.slice(0, 4).map((item) => <span key={item}><Check aria-hidden="true" />{item}</span>)}</span>;
  }

  return value || "Not available";
}

function RecommendedTools({ onOpenSelector, selectedSlugs }: { onOpenSelector: () => void; selectedSlugs: string[] }) {
  const recommendations = compareTools.filter((tool) => !selectedSlugs.includes(tool.slug)).slice(0, 4);

  return (
    <section className={styles.recommended}>
      <div className={styles.recommendedHeader}>
        <div>
          <h2>Recommended tools</h2>
          <p>Start with popular, well-described records from the Pluto library.</p>
        </div>
        <PlutoButton onClick={onOpenSelector} type="button" variant="secondary">
          <Plus aria-hidden="true" className="h-4 w-4" /> Add a tool
        </PlutoButton>
      </div>
      <div className={styles.recommendedGrid}>
        {recommendations.map((tool) => (
          <Link className={styles.recommendedCard} href={`${tool.href}`} key={tool.slug}>
            <ToolLogo className={styles.recommendedLogo} name={tool.name} src={tool.logoUrl} />
            <span>{tool.name}</span>
            <small>{tool.bestFor}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ToolSelector({
  onClose,
  onSelect,
  recentlyViewed,
  selectedSlugs,
  selector
}: {
  onClose: () => void;
  onSelect: (tool: CompareTool) => void;
  recentlyViewed: RecentToolRecord[];
  selectedSlugs: string[];
  selector: SelectorState | null;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");

  const results = useMemo(() => {
    const base = searchCompareTools(query, selectedSlugs, 36).filter((tool) => category === "All categories" || tool.category === category);
    return base.slice(0, 18);
  }, [category, query, selectedSlugs]);
  const recentTools = recentlyViewed.map((item) => getCompareTool(item.slug)).filter(Boolean).slice(0, 4) as CompareTool[];

  return (
    <Dialog.Root open={Boolean(selector)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.selectorOverlay} />
        <Dialog.Content className={styles.selectorContent}>
          <div className={styles.selectorHeader}>
            <div>
              <Dialog.Title>{selector?.mode === "replace" ? "Change tool" : "Add a tool"}</Dialog.Title>
              <Dialog.Description>Search by name, category, use case, or keyword.</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className={styles.selectorClose} aria-label="Close tool selector" type="button"><X aria-hidden="true" /></button>
            </Dialog.Close>
          </div>

          <div className={styles.selectorControls}>
            <label className={styles.searchBox}>
              <Search aria-hidden="true" />
              <span className="sr-only">Search tools</span>
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, use cases, platforms..." />
            </label>
            <label className="sr-only" htmlFor="compare-category">Category</label>
            <select className="pf-select-trigger" id="compare-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {recentTools.length > 0 && !query ? (
            <section className={styles.selectorSection}>
              <h3>Recently viewed</h3>
              <div className={styles.selectorGrid}>
                {recentTools.map((tool) => <SelectorTool key={tool.slug} selected={selectedSlugs.includes(tool.slug)} tool={tool} onSelect={onSelect} />)}
              </div>
            </section>
          ) : null}

          <section className={styles.selectorSection}>
            <h3>{query ? "Search results" : "Recommended tools"}</h3>
            {results.length === 0 ? <p className={styles.selectorStatus}>No tools match that search.</p> : null}
            <div className={styles.selectorGrid}>
              {results.map((tool) => <SelectorTool key={tool.slug} selected={tool.alreadySelected} tool={tool} onSelect={onSelect} />)}
            </div>
          </section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SelectorTool({ onSelect, selected, tool }: { onSelect: (tool: CompareTool) => void; selected?: boolean; tool: CompareTool }) {
  return (
    <article className={styles.selectorTool}>
      <ToolLogo className={styles.selectorLogo} name={tool.name} src={tool.logoUrl} />
      <div>
        <h4>{tool.name}</h4>
        <p>{tool.category}</p>
        <small>{tool.bestFor}</small>
      </div>
      <button disabled={selected} onClick={() => onSelect(tool)} type="button">
        {selected ? "Added" : "Add"}
      </button>
    </article>
  );
}
