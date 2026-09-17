"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CompareButton } from "@/components/compare/compare-button";
import { ToolLogo } from "@/components/shared/tool-logo";
import { PlutoButton } from "@/components/ui/pluto-button";
import type { LibraryTool } from "@/lib/plutos-library";
import { getFaviconLogoUrl } from "@/lib/tool-logo";
import { cn } from "@/lib/utils";
import styles from "./library-tool-card.module.css";

export function LibraryToolCard({ tool }: { tool: LibraryTool }) {
  const detailHref = `/tools/${tool.slug}`;
  const logoSrc = getFaviconLogoUrl(tool.domain || tool.officialUrl || tool.originalOfficialUrl);
  const verified = tool.verification.status.toLowerCase() === "verified";

  const track = (eventType: string) => {
    void fetch("/api/plutos-library/events", {
      body: JSON.stringify({ eventType, toolSlug: tool.slug }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }).catch(() => undefined);
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Link className={styles.logoLink} href={detailHref} onClick={() => track("tool_view")}>
          <ToolLogo className={styles.logoTile} imageClassName={styles.logo} name={tool.name} src={logoSrc} />
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

      <div className={styles.metaLine}>
        <span className={styles.priceModel}>{tool.pricing.model || "Unknown"}</span>
        <span aria-hidden="true" className={styles.metaDot}>Ã¢â‚¬Â¢</span>
        <span>{formatStartingPrice(tool.pricing.startingPriceRaw)}</span>
      </div>

      <div className={styles.actions}>
        <PlutoButton fullWidth href={detailHref} onClick={() => track("tool_view")} showArrow variant="primary">
          View details
        </PlutoButton>
        <CompareButton afterSelection={() => track("compare")} toolName={tool.name} toolSlug={tool.slug} variant="secondary" />
      </div>
    </article>
  );
}

function formatStartingPrice(value: string) {
  if (!value) return "See pricing";
  if (value.length <= 26) return value;

  const currencyMatch = value.match(/(?:from\s+)?(?:~)?(?:\$|Ã¢â€šÂ¬|Ã‚Â£)\s?\d[\d,.]*(?:\.\d+)?(?:\s?\/\s?(?:mo|month|yr|year))?/i);
  if (currencyMatch) return `From ${currencyMatch[0].replace(/^from\s+/i, "")}`;

  if (/free/i.test(value)) return "Free plan";
  if (/custom/i.test(value)) return "Custom pricing";
  if (/not independently verified|official pricing/i.test(value)) return "See pricing";

  return `${value.slice(0, 23).trim()}...`;
}
