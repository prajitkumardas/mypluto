"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BackgroundVideo } from "./background-video";
import { SplitText } from "./split-text";
import styles from "./pluto-story-section.module.css";

const PLUTO_STORY_TEXT = "My name is Pluto. It\u2019s been a while since I left the world, but I\u2019m still here\u2014helping you discover the best AI tools for your needs.";

export function PlutoStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = Boolean(prefersReducedMotion);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const frameY = useTransform(scrollYProgress, [0, 0.17], ["100%", "0%"]);
  const frameScale = useTransform(scrollYProgress, [0, 0.17], [0.98, 1]);
  const frameRadius = useTransform(scrollYProgress, [0, 0.17], ["1.75rem", "0rem"]);
  const frameShadow = useTransform(
    scrollYProgress,
    [0, 0.17],
    ["0 -28px 80px rgba(0, 0, 0, 0.42)", "0 0 0 rgba(0, 0, 0, 0)"]
  );
  const labelOpacity = useTransform(scrollYProgress, [0.28, 0.33], [0, 1]);
  const videoScale = useTransform(scrollYProgress, [0.17, 1], [1.04, 1.12]);

  return (
    <section
      aria-labelledby="pluto-story-title"
      className={`${styles.storySection} ${reducedMotion ? styles.reducedMotion : ""}`}
      ref={sectionRef}
    >
      <div className={styles.storySticky}>
        <motion.div
          className={styles.storyFrame}
          style={
            reducedMotion
              ? { borderRadius: 0, boxShadow: "none", scale: 1, y: 0 }
              : { borderRadius: frameRadius, boxShadow: frameShadow, scale: frameScale, y: frameY }
          }
        >
          <BackgroundVideo scale={reducedMotion ? 1.03 : videoScale} reducedMotion={reducedMotion} />
          <div className={styles.overlay} aria-hidden="true" />
          <div className={styles.copyLayer}>
            <div className={styles.copyInner}>
              <motion.p className={styles.eyebrow} style={reducedMotion ? { opacity: 1 } : { opacity: labelOpacity }}>A NOTE FROM PLUTO</motion.p>
              <div>
                <SplitText
                  className={styles.revealText}
                  delay={28}
                  duration={1.25}
                  ease="power3.out"
                  from={{ opacity: 0, y: 40 }}
                  id="pluto-story-title"
                  reducedMotion={reducedMotion}
                  revealEnd={0.82}
                  revealStart={0.33}
                  splitType="chars"
                  tag="p"
                  text={PLUTO_STORY_TEXT}
                  textAlign="left"
                  to={{ opacity: 1, y: 0 }}
                  triggerRef={sectionRef}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
