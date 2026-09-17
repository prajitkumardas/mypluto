"use client";

import dynamic from "next/dynamic";
import { VisualEffectBoundary } from "@/components/shared/visual-effect-boundary";
import { cn } from "@/lib/utils";
import { useWebGLSupport } from "@/lib/webgl-support";

const DarkVeil = dynamic(
  () => import("@/components/shared/dark-veil").then((module) => module.DarkVeil),
  { ssr: false }
);

type HeroVeilProps = {
  className?: string;
};

export function HeroVeil({ className }: HeroVeilProps) {
  const webgl = useWebGLSupport();

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute left-0 right-0 top-0 z-0 overflow-hidden", className)}>
      {webgl.available ? (
        <VisualEffectBoundary>
          <DarkVeil
            hueShift={0}
            noiseIntensity={0.1}
            scanlineIntensity={0.55}
            speed={1.5}
            scanlineFrequency={0}
            warpAmount={2.1}
          />
        </VisualEffectBoundary>
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(124,99,255,0.24),transparent_28rem),linear-gradient(180deg,rgba(8,8,23,0.18),#080817_92%)]" />
    </div>
  );
}
