import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  tone?: "violet" | "lime" | "neutral" | "info" | "success";
  icon?: boolean;
  className?: string;
};

export function Badge({
  children,
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-0 items-center gap-1.5 rounded-none bg-transparent px-0 type-overline text-[var(--section-heading-color)] [&>svg]:hidden",
        className,
        "bg-transparent text-[var(--section-heading-color)]"
      )}
    >
      {children}
    </span>
  );
}

