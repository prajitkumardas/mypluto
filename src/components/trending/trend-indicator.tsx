import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { TrendingTool, TrendPeriod } from "@/lib/trending";
import { cn } from "@/lib/utils";
import styles from "./trend-indicator.module.css";

export function TrendIndicator({ className, period, tool }: { className?: string; period: TrendPeriod; tool: TrendingTool }) {
  if (period === "new") {
    return (
      <span className={cn(styles.trend, styles.positive, className)} title="Newly added to the verified Pluto library.">
        New {tool.releaseDate ? <span className={styles.date}>{formatShortDate(tool.releaseDate)}</span> : null}
      </span>
    );
  }

  if (period === "updated") {
    return (
      <span className={cn(styles.trend, styles.positive, className)} title={tool.updateLabel || "Recently verified material update."}>
        Updated {tool.lastMaterialUpdateAt ? <span className={styles.date}>{formatShortDate(tool.lastMaterialUpdateAt)}</span> : null}
      </span>
    );
  }

  if (tool.rankChange === null) {
    return <span className={cn(styles.trend, styles.neutral, className)} title="Insufficient history for movement.">New</span>;
  }

  if (tool.rankChange > 0) {
    return (
      <span className={cn(styles.trend, styles.positive, className)} title={`Moved up ${tool.rankChange} positions compared with the previous ${getPeriodWindow(period)}.`}>
        <ArrowUp aria-hidden="true" /> {tool.rankChange}
      </span>
    );
  }

  if (tool.rankChange < 0) {
    return (
      <span className={cn(styles.trend, styles.negative, className)} title={`Moved down ${Math.abs(tool.rankChange)} positions compared with the previous ${getPeriodWindow(period)}.`}>
        <ArrowDown aria-hidden="true" /> {Math.abs(tool.rankChange)}
      </span>
    );
  }

  return (
    <span className={cn(styles.trend, styles.neutral, className)} title={`No rank change compared with the previous ${getPeriodWindow(period)}.`}>
      <Minus aria-hidden="true" />
    </span>
  );
}

function getPeriodWindow(period: TrendPeriod) {
  if (period === "today") return "rolling 24-hour period";
  if (period === "month") return "rolling 30-day period";
  if (period === "new") return "recent 30-day release window";
  if (period === "updated") return "recent 30-day update window";
  return "rolling seven-day period";
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short" }).format(date);
}
