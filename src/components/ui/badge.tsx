import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  tone?: "violet" | "lime" | "neutral" | "info" | "success";
  icon?: boolean;
  className?: string;
};

export function Badge({
  children,
  tone = "neutral",
  icon = false,
  className
}: BadgeProps) {
  const tones = {
    violet: "bg-violet-100 text-[#5842D8]",
    lime: "bg-lime-100 text-ink-950",
    neutral: "bg-neutral-100 text-neutral-700",
    info: "bg-[#E5F2FF] text-[#2166B1]",
    success: "bg-[#E3F8EC] text-[#157A4A]"
  };

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {icon ? <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}
