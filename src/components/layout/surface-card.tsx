import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceCardProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  as?: "article" | "div" | "section";
  interactive?: boolean;
  padding?: "sm" | "md" | "lg";
};

const paddingClass = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6"
};

export function SurfaceCard({ as: Comp = "div", children, className, interactive = false, padding = "md", ...props }: SurfaceCardProps) {
  return (
    <Comp
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] shadow-[var(--shadow-xs)]",
        paddingClass[padding],
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-brand)] hover:bg-[var(--surface-hover)]",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
