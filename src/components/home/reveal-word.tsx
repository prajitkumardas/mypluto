"use client";

import type { MotionValue } from "motion/react";
import { motion, useTransform } from "motion/react";
import styles from "./pluto-story-section.module.css";

type RevealWordProps = {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  reducedMotion: boolean;
};

export function RevealWord({ children, progress, range, reducedMotion }: RevealWordProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const y = useTransform(progress, range, [3, 0]);
  const filter = useTransform(progress, range, ["blur(1px)", "blur(0px)"]);

  return (
    <motion.span
      className={styles.word}
      style={reducedMotion ? { opacity: 1, y: 0, filter: "none" } : { opacity, y, filter }}
    >
      {children}
    </motion.span>
  );
}
