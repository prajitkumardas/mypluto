import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { StaggerText } from "@/components/ui/stagger-text";
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
  compact: "type-h1",
  hero: "type-h1"
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
      {typeof title === "string" || typeof title === "number" ? (
        <StaggerText as="h1" className={cn("mt-4 text-[var(--text-primary)]", titleClass[size])}>{title}</StaggerText>
      ) : (
        <h1 className={cn("mt-4 text-[var(--text-primary)]", titleClass[size])}>{title}</h1>
      )}
      {typeof description === "string" || typeof description === "number" ? (
        <StaggerText as="p" className="mt-4 max-w-[var(--text-width-md)] type-body-lg text-[var(--text-secondary)]" delay={0.12}>
          {description}
        </StaggerText>
      ) : description ? (
        <p className="mt-4 max-w-[var(--text-width-md)] type-body-lg text-[var(--text-secondary)]">{description}</p>
      ) : null}
      {actions ? <div className={cn("mt-6 flex flex-wrap gap-3", alignment === "center" && "justify-center")}>{actions}</div> : null}
    </header>
  );
}
