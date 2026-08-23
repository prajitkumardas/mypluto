"use client";

import type { MotionValue } from "motion/react";
import { useMemo } from "react";
import { RevealWord } from "./reveal-word";
import styles from "./pluto-story-section.module.css";

type ScrollRevealTextProps = {
  id?: string;
  text: string;
  progress: MotionValue<number>;
  revealStart?: number;
  revealEnd?: number;
  reducedMotion: boolean;
};

export function ScrollRevealText({
  id,
  text,
  progress,
  revealStart = 0.3,
  revealEnd = 0.85,
  reducedMotion
}: ScrollRevealTextProps) {
  const words = useMemo(() => text.split(" "), [text]);
  const revealDistance = revealEnd - revealStart;
  const interval = revealDistance / words.length;
  const transitionLength = interval * 1.85;

  return (
    <p aria-label={text} className={styles.revealText} id={id}>
      <span aria-hidden="true">
        {words.map((word, index) => {
          const wordStart = revealStart + index * interval;
          const wordEnd = Math.min(revealEnd, wordStart + transitionLength);

          return (
            <span key={`${word}-${index}`}>
              <RevealWord progress={progress} range={[wordStart, wordEnd]} reducedMotion={reducedMotion}>
                {word}
              </RevealWord>
              {index < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </span>
    </p>
  );
}
