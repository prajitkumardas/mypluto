"use client";

import type { MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from "motion/react";
import { useEffect } from "react";
import { VisualEffectBoundary } from "@/components/shared/visual-effect-boundary";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import { cn } from "@/lib/utils";
import { useWebGLSupport } from "@/lib/webgl-support";
import styles from "./animated-hero-background.module.css";

const MoltenMetal = dynamic(() => import("@/components/MoltenMetal"), { ssr: false });

type AnimatedHeroBackgroundProps = {
  className?: string;
  renderMolten?: boolean;
  scale?: MotionValue<number> | number;
};

export function AnimatedHeroBackground({ className, renderMolten = true, scale = 1 }: AnimatedHeroBackgroundProps) {
  const reduceMotion = useReducedMotionPreference();
  const webgl = useWebGLSupport();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 65, damping: 26, mass: 1 });
  const smoothY = useSpring(pointerY, { stiffness: 65, damping: 26, mass: 1 });
  const glowAX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const glowAY = useTransform(smoothY, [-1, 1], [-8, 8]);
  const glowBX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const glowBY = useTransform(smoothY, [-1, 1], [-14, 14]);
  const glowCX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const glowCY = useTransform(smoothY, [-1, 1], [-22, 22]);

  useEffect(() => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    let frameId: number | null = null;
    let nextX = 0;
    let nextY = 0;

    const updatePointer = () => {
      frameId = null;
      pointerX.set(nextX);
      pointerY.set(nextY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      nextX = (event.clientX / window.innerWidth) * 2 - 1;
      nextY = (event.clientY / window.innerHeight) * 2 - 1;
      if (frameId === null) frameId = window.requestAnimationFrame(updatePointer);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div aria-hidden="true" className={cn(styles.root, className)}>
      {!reduceMotion && renderMolten && webgl.available ? (
        <div className={styles.moltenLayer}>
          <VisualEffectBoundary>
            <MoltenMetal
              blackPoint={0.09}
              brightness={1.3}
              color1="#5227FF"
              color2="#FF9FFC"
              color3="#FFFFFF"
              colorMode="molten"
              coreSize={0.14}
              detail={3}
              fold={-0.1}
              glow={2.2}
              grain
              grainIntensity={0.09}
              mouseInteraction
              mouseStrength={0.3}
              opacity={1}
              scale={4}
              speed={0.15}
              swirl={0.4}
            />
          </VisualEffectBoundary>
        </div>
      ) : null}

      <motion.div className={styles.glowField} style={{ scale }}>
        <motion.div className={styles.glowA} style={{ x: glowAX, y: glowAY }} />
        <motion.div className={styles.glowB} style={{ x: glowBX, y: glowBY }} />
        <motion.div className={styles.glowC} style={{ x: glowCX, y: glowCY }} />
      </motion.div>
    </div>
  );
}
