import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 type-label-sm [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        violet: "border-[var(--border-brand)] bg-[rgba(145,61,255,0.14)] text-[var(--color-pluto-purple-300)]",
        lime: "border-[rgba(200,255,90,0.34)] bg-[rgba(200,255,90,0.1)] text-[var(--text-brand)]",
        neutral: "border-[var(--border-default)] bg-[var(--background-interactive)] text-[var(--text-secondary)]",
        info: "border-[rgba(120,215,255,0.34)] bg-[rgba(120,215,255,0.1)] text-[var(--status-info)]",
        success: "border-[rgba(117,242,142,0.34)] bg-[rgba(117,242,142,0.1)] text-[var(--status-success)]",
        warning: "border-[rgba(255,211,110,0.36)] bg-[rgba(255,211,110,0.1)] text-[var(--status-warning)]",
        danger: "border-[rgba(255,138,138,0.34)] bg-[rgba(255,138,138,0.1)] text-[var(--status-danger)]"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  className?: string;
  icon?: boolean;
};

export function Badge({ children, className, tone }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))}>{children}</span>;
}
