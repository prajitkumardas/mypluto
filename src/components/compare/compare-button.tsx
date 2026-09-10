"use client";

import { Check, GitCompareArrows, Lock } from "lucide-react";
import { PlutoButton, type PlutoButtonProps } from "@/components/ui/pluto-button";
import { MAX_COMPARE_TOOLS, useCompareStore } from "@/lib/compare-store";
import { cn } from "@/lib/utils";

type CompareButtonProps = Omit<PlutoButtonProps, "children" | "text" | "showArrow" | "variant"> & {
  afterSelection?: () => void;
  compact?: boolean;
  selectedLabel?: string;
  toolName: string;
  toolSlug: string;
  variant?: PlutoButtonProps["variant"] | "outline" | "ghost" | "lime";
};

export function CompareButton({
  afterSelection,
  className,
  compact = false,
  onClick,
  selectedLabel = "Added",
  toolName,
  toolSlug,
  variant = "secondary",
  ...props
}: CompareButtonProps) {
  const selected = useCompareStore((state) => state.selected);
  const addTool = useCompareStore((state) => state.addTool);
  const removeTool = useCompareStore((state) => state.removeTool);
  const isSelected = selected.includes(toolSlug);
  const atLimit = selected.length >= MAX_COMPARE_TOOLS && !isSelected;
  const label = isSelected ? selectedLabel : atLimit ? "Limit 4" : "Compare";
  const plutoVariant: PlutoButtonProps["variant"] = variant === "primary" && !isSelected ? "primary" : "secondary";

  return (
    <PlutoButton
      ariaLabel={atLimit ? `You can compare up to ${MAX_COMPARE_TOOLS} tools` : undefined}
      className={cn("whitespace-nowrap", isSelected && "border-lime-400/44 text-lime-200", className)}
      disabled={atLimit}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (isSelected) {
          removeTool(toolSlug, toolName);
          afterSelection?.();
          return;
        }

        const result = addTool(toolSlug, toolName);
        if (result.status === "added") afterSelection?.();
      }}
      title={atLimit ? `You can compare up to ${MAX_COMPARE_TOOLS} tools. Open Compare to replace a tool.` : isSelected ? `Remove ${toolName} from comparison` : `Add ${toolName} to comparison`}
      type="button"
      variant={plutoVariant}
      {...props}
    >
      {isSelected ? <Check aria-hidden="true" className="h-4 w-4" /> : atLimit ? <Lock aria-hidden="true" className="h-4 w-4" /> : <GitCompareArrows aria-hidden="true" className="h-4 w-4" />}
      {compact ? label : isSelected ? selectedLabel : atLimit ? "Limit 4" : "Compare"}
    </PlutoButton>
  );
}