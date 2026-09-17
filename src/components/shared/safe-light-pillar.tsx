"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type LightPillar from "@/components/ui/light-pillar";
import { VisualEffectBoundary } from "@/components/shared/visual-effect-boundary";
import { useWebGLSupport } from "@/lib/webgl-support";

const LightPillarEffect = dynamic(() => import("@/components/ui/light-pillar"), { ssr: false });

export function SafeLightPillar(props: ComponentProps<typeof LightPillar>) {
  const support = useWebGLSupport();
  if (!support.available) return null;

  return (
    <VisualEffectBoundary>
      <LightPillarEffect {...props} />
    </VisualEffectBoundary>
  );
}
