"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import styles from "./global-loader.module.css";

const WALKING_CAT_SRC = "/images/loading/pluto-walking.webp";
const FALLBACK_CAT_SRC = "/images/home/hero/pluto-cat-mascot.png";

export type GlobalLoaderMode = "determinate" | "indeterminate";

export interface GlobalLoaderProps {
  exiting?: boolean;
  mode?: GlobalLoaderMode;
  progress?: number;
  visible?: boolean;
}

export function GlobalLoader({
  exiting = false,
  mode = "indeterminate",
  progress,
  visible = true
}: GlobalLoaderProps) {
  const reduceMotion = useReducedMotionPreference();
  const [assetFailed, setAssetFailed] = useState(false);
  const [automaticProgress, setAutomaticProgress] = useState(14);

  useEffect(() => {
    if (mode !== "indeterminate" || progress !== undefined) return;

    const stages = [
      window.setTimeout(() => setAutomaticProgress(38), 260),
      window.setTimeout(() => setAutomaticProgress(64), 980),
      window.setTimeout(() => setAutomaticProgress(86), 2_100)
    ];

    return () => stages.forEach(window.clearTimeout);
  }, [mode, progress]);

  if (!visible) return null;

  const displayedProgress = Math.min(100, Math.max(0, progress ?? automaticProgress));

  return (
    <motion.div
      animate={{ opacity: exiting ? 0 : 1 }}
      aria-label="Loading"
      aria-live="polite"
      className={styles.root}
      data-loader-mode={mode}
      exit={{ opacity: 0 }}
      initial={false}
      role="status"
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div aria-hidden="true" className={styles.ambientGlow} />

      <div className={styles.content}>
        <div aria-hidden="true" className={styles.scene}>
          <div className={styles.catFrame}>
            <Image
              alt=""
              className={styles.cat}
              fill
              onError={() => setAssetFailed(true)}
              priority
              sizes="(max-width: 639px) 70vw, (max-width: 1024px) 44vw, 34vw"
              src={assetFailed ? FALLBACK_CAT_SRC : WALKING_CAT_SRC}
              unoptimized
            />
          </div>

          <div className={styles.groundGlow} />
        </div>

        <div className={styles.status}>
          <p className={styles.label}>Loading...</p>
          <div aria-hidden="true" className={styles.progressTrack}>
            <motion.div
              animate={{ scaleX: displayedProgress / 100 }}
              className={styles.progressFill}
              initial={false}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
