"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Code2, Gift, Globe2, Plus, Share2, Tag } from "lucide-react";
import type { LibraryTool } from "@/lib/plutos-library";
import { useCompareStore } from "@/lib/compare-store";
import { cn } from "@/lib/utils";
import styles from "./library-tool-card.module.css";

const logoFallback = "/images/home/hero/pluto-cat-mascot.png";

export function LibraryToolCard({ tool }: { tool: LibraryTool }) {
  const selected = useCompareStore((state) => state.selected);
  const addTool = useCompareStore((state) => state.addTool);
  const isSelected = selected.includes(tool.slug);
  const atLimit = selected.length >= 4 && !isSelected;
  const detailHref = `/plutos-library/tool/${tool.slug}`;
  const [logoSrc, setLogoSrc] = useState(getLogoUrl(tool));
  const verified = tool.verification.status.toLowerCase() === "verified";
  const platforms = tool.platforms.slice(0, 3);
  const tags = tool.subcategories.slice(0, 2);

  const track = (eventType: string) => {
    void fetch("/api/plutos-library/events", {
      body: JSON.stringify({ eventType, toolSlug: tool.slug }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }).catch(() => undefined);
  };

  const handleCompare = () => {
    addTool(tool.slug);
    track("compare");
  };

  const handleShare = () => {
    track("share");

    if (typeof window === "undefined") return;

    const url = new URL(detailHref, window.location.origin).toString();
    if (navigator.share) {
      void navigator.share({ title: tool.name, text: tool.shortDescription, url }).catch(() => undefined);
      return;
    }

    void navigator.clipboard?.writeText(url).catch(() => undefined);
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Link className={styles.logoLink} href={detailHref} onClick={() => track("tool_view")}>
          <span className={styles.logoTile}>
            <Image
              alt={`${tool.name} logo`}
              className={styles.logo}
              height={128}
              onError={() => setLogoSrc(logoFallback)}
              src={logoSrc}
              width={128}
            />
          </span>
        </Link>

        <span className={cn(styles.verifiedBadge, !verified && styles.pendingBadge)}>
          <CheckCircle2 aria-hidden="true" />
          {verified ? "Verified" : tool.verification.status}
        </span>
      </div>

      <Link className={styles.titleBlock} href={detailHref} onClick={() => track("tool_view")}>
        <span className={styles.name}>{tool.name}</span>
        <span className={styles.category}>{tool.categories[0] ?? "Uncategorized"}</span>
      </Link>

      <p className={styles.description}>{tool.shortDescription}</p>

      <dl className={styles.facts}>
        <Fact icon={Tag} label="Pricing" value={tool.pricing.model} />
        <Fact icon={Gift} label="Free access" value={tool.pricing.freePlan} />
        <Fact icon={Code2} label="API" value={tool.api.normalized} />
      </dl>

      <div className={styles.platforms}>
        <Globe2 aria-hidden="true" />
        <span>{platforms.length > 0 ? platforms.join(" / ") : "Information not available"}</span>
      </div>

      {tags.length > 0 ? (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span className={styles.tag} key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <div className={styles.actions}>
        <Link className={cn(styles.actionButton, styles.primaryAction)} href={detailHref} onClick={() => track("tool_view")}>
          View details
          <ArrowRight aria-hidden="true" />
        </Link>
        <button
          className={cn(styles.actionButton, styles.secondaryAction, isSelected && styles.selectedAction)}
          disabled={atLimit}
          onClick={handleCompare}
          type="button"
        >
          <Plus aria-hidden="true" />
          {isSelected ? "Added" : atLimit ? "Limit 4" : "Compare"}
        </button>
        <button className={cn(styles.actionButton, styles.shareAction)} onClick={handleShare} type="button">
          <Share2 aria-hidden="true" />
          Share
        </button>
      </div>
    </article>
  );
}

function Fact({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.factRow}>
      <dt className={styles.factLabel}>
        <span className={styles.factIcon}>
          <Icon aria-hidden="true" />
        </span>
        {label}
      </dt>
      <dd className={styles.factValue}>{value || "Unknown"}</dd>
    </div>
  );
}

function getLogoUrl(tool: LibraryTool) {
  const domain = tool.domain || tool.officialUrl || tool.originalOfficialUrl;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}
