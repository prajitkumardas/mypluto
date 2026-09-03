import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  actions?: ReactNode;
  alignment?: "left" | "center";
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  eyebrowTone?: BadgeProps["tone"];
  size?: "default" | "compact" | "hero";
  title: ReactNode;
};

const alignmentClass = {
  left: "items-start text-left",
  center: "items-center text-center mx-auto"
};

const widthClass = {
  default: "max-w-[var(--text-width-lg)]",
  compact: "max-w-[var(--text-width-md)]",
  hero: "max-w-[var(--text-width-xl)]"
};

const titleClass = {
  default: "type-h1",
  compact: "type-h2",
  hero: "font-display text-[var(--text-page-hero-title)] font-medium leading-[var(--leading-page-hero-title)] tracking-[0] [text-wrap:balance]"
};

export function PageHeader({
  actions,
  alignment = "left",
  className,
  description,
  eyebrow,
  eyebrowTone = "violet",
  size = "default",
  title
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col", alignmentClass[alignment], widthClass[size], className)}>
      {eyebrow ? <Badge tone={eyebrowTone}>{eyebrow}</Badge> : null}
      <h1 className={cn("mt-4 text-[var(--text-primary)]", titleClass[size])}>{title}</h1>
      {description ? <p className="mt-4 max-w-[var(--text-width-md)] type-body-lg text-[var(--text-secondary)]">{description}</p> : null}
      {actions ? <div className={cn("mt-6 flex flex-wrap gap-3", alignment === "center" && "justify-center")}>{actions}</div> : null}
    </header>
  );
}
