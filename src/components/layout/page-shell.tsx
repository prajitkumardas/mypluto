import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = Omit<ComponentPropsWithoutRef<"main">, "children"> & {
  as?: "main" | "section";
  children: ReactNode;
  width?: "wide" | "standard" | "content" | "narrow";
  spacing?: "default" | "compact" | "none";
};

const widthClass = {
  wide: "max-w-[var(--page-max)]",
  standard: "max-w-[var(--page-standard)]",
  content: "max-w-[var(--page-content)]",
  narrow: "max-w-[var(--page-narrow)]"
};

const spacingClass = {
  default: "pt-[var(--section-space-start)] pb-[var(--section-space-end)]",
  compact: "py-14 lg:py-16",
  none: "py-0"
};

export function PageShell({
  as = "main",
  children,
  className,
  spacing = "default",
  width = "wide",
  ...props
}: PageShellProps) {
  const shellClassName = cn(
    "mx-auto w-full px-[var(--page-gutter)] text-[var(--text-primary)]",
    widthClass[width],
    spacingClass[spacing],
    className
  );

  if (as === "section") {
    return (
      <section className={shellClassName} {...props}>
        {children}
      </section>
    );
  }

  return (
    <main className={shellClassName} {...props}>
      {children}
    </main>
  );
}

type SectionShellProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
  width?: PageShellProps["width"];
  spacing?: PageShellProps["spacing"];
};

export function SectionShell({ children, className, spacing = "default", width = "wide", ...props }: SectionShellProps) {
  return (
    <section className={cn(spacingClass[spacing], className)} {...props}>
      <div className={cn("mx-auto w-full px-[var(--page-gutter)]", widthClass[width])}>{children}</div>
    </section>
  );
}


