"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type Silk from "@/components/ui/silk";
import { VisualEffectBoundary } from "@/components/shared/visual-effect-boundary";
import { useWebGLSupport } from "@/lib/webgl-support";

const SilkEffect = dynamic(() => import("@/components/ui/silk"), { ssr: false });

export function SafeSilk(props: ComponentProps<typeof Silk>) {
  const support = useWebGLSupport();
  if (!support.available) return null;

  return (
    <VisualEffectBoundary>
      <SilkEffect {...props} />
    </VisualEffectBoundary>
  );
}
