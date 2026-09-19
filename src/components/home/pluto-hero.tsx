"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform
} from "motion/react";
import { Mouse } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedHeroBackground } from "@/components/shared/animated-hero-background";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import { PlutoButton } from "@/components/ui/pluto-button";
import { CatExperience } from "./cat-experience";
import { HeroParticleIntro } from "./hero-particle-intro";
import styles from "./pluto-hero.module.css";

const HERO_INTRO_STORAGE_KEY = "pluto_intro_seen";
const heroMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  introFallbackDuration: 7.2
};
function mapScrollRange(value: number, start: number, end: number, from: number, to: number) {
  const progress = Math.min(Math.max((value - start) / (end - start), 0), 1);
  return from + (to - from) * progress;
}

export function PlutoHero() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const [introComplete, setIntroComplete] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const catScale = useTransform(scrollYProgress, [0, 0.28, 0.55, 0.8, 1], [1, 1.03, 1.16, 1.22, 1.26]);
  const catOpacity = useTransform(scrollYProgress, [0, 0.42, 0.68, 1], [1, 1, 0.72, 0.48]);
  const catY = useTransform(scrollYProgress, [0, 0.48, 1], [0, 20, 46]);
  const greetingOpacity = useTransform(scrollYProgress, (value) => {
    if (value <= 0.1) return 1;
    if (value <= 0.3) return mapScrollRange(value, 0.1, 0.3, 1, 0.5);
    return mapScrollRange(value, 0.3, 0.38, 0.5, 0);
  });
  const greetingY = useTransform(scrollYProgress, (value) => mapScrollRange(value, 0, 0.38, 0, -48));
  const cueOpacity = useTransform(scrollYProgress, (value) => {
    if (value <= 0.12) return mapScrollRange(value, 0, 0.12, 1, 0.8);
    return mapScrollRange(value, 0.12, 0.28, 0.8, 0);
  });
  const finishIntro = useCallback(() => {
    setIntroComplete(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(HERO_INTRO_STORAGE_KEY, "true");
      } catch {
        // The intro can still complete when browser storage is unavailable.
      }
      delete document.documentElement.dataset.plutoLandingReload;
      document.documentElement.dataset.plutoIntroSeen = "true";
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = window.setTimeout(finishIntro, 0);
      return () => window.clearTimeout(timer);
    }

    const replayLandingIntro = document.documentElement.dataset.plutoLandingReload === "true";
    if (replayLandingIntro) {
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
      window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    }

    let seenIntro = false;
    try {
      seenIntro = sessionStorage.getItem(HERO_INTRO_STORAGE_KEY) === "true";
    } catch {
      // Treat storage-restricted sessions as a fresh visit.
    }
    if (seenIntro && !replayLandingIntro) {
      const timer = window.setTimeout(finishIntro, 0);
      return () => window.clearTimeout(timer);
    }

    const fallbackTimer = window.setTimeout(finishIntro, heroMotion.introFallbackDuration * 1000);
    return () => window.clearTimeout(fallbackTimer);
  }, [finishIntro, prefersReducedMotion]);

  useEffect(() => {
    if (introComplete) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (["Enter", " ", "Escape"].includes(event.key)) {
        finishIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finishIntro, introComplete]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const replayLandingIntro = document.documentElement.dataset.plutoLandingReload === "true";
    if (!introComplete && !replayLandingIntro && value > 0.02) {
      finishIntro();
    }
  });

  return (
    <section className={styles.hero} ref={heroRef} aria-labelledby="home-hero-title">
      <div className={styles.heroSticky}>
        <AnimatedHeroBackground renderMolten={introComplete} scale={glowScale} />

        {!introComplete ? <HeroIntro onComplete={finishIntro} /> : null}

        <motion.div
          aria-hidden="true"
          className={styles.catLayer}
          style={{ scale: prefersReducedMotion ? 1 : catScale, opacity: prefersReducedMotion ? 1 : catOpacity, y: prefersReducedMotion ? 0 : catY }}
        >
          <CatExperience reduceMotion={prefersReducedMotion} visible={introComplete} />
        </motion.div>

        <motion.div
          className={styles.greetingState}
          style={{ opacity: prefersReducedMotion ? 1 : greetingOpacity, y: prefersReducedMotion ? 0 : greetingY }}
        >
          <div>
            <motion.p
              animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 14 }}
              className={styles.greetingEyebrow}
              initial={false}
              transition={{ duration: 0.64, delay: introComplete ? 0.1 : 0, ease: heroMotion.ease }}
            >
              Hey buddy,<span aria-hidden="true">{"\uD83D\uDC4B"}</span>
            </motion.p>
            <motion.h1
              animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 16 }}
              className={styles.greetingTitle}
              id="home-hero-title"
              initial={false}
              transition={{ duration: 0.68, delay: introComplete ? 0.18 : 0, ease: heroMotion.ease }}
            >
              Great to have you here!
            </motion.h1>
            <motion.p
              animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 16 }}
              className={styles.greetingCopy}
              initial={false}
              transition={{ duration: 0.68, delay: introComplete ? 0.28 : 0, ease: heroMotion.ease }}
            >
              Discover the best AI tools, handpicked and compared to help you explore, create, and do more.
            </motion.p>
            <motion.div
              animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 16 }}
              className={styles.greetingActions}
              initial={false}
              transition={{ duration: 0.68, delay: introComplete ? 0.38 : 0, ease: heroMotion.ease }}
            >
              <PlutoButton href="/plutos-library" showArrow size="lg" variant="primary">
                Discover AI Tools
              </PlutoButton>
              <PlutoButton href="/play" showArrow size="lg" variant="secondary">
                Play with Me
              </PlutoButton>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className={styles.scrollCue}
          style={{ opacity: prefersReducedMotion ? 0 : cueOpacity }}
          aria-hidden="true"
        >
          <Mouse className={styles.scrollCueIcon} />
        </motion.div>

      </div>
    </section>
  );
}

function HeroIntro({ onComplete }: { onComplete: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const completionTimerRef = useRef<number | null>(null);

  const handleSequenceComplete = useCallback(() => {
    if (completionTimerRef.current !== null) return;
    setIsExiting(true);
    completionTimerRef.current = window.setTimeout(onComplete, 560);
  }, [onComplete]);

  useEffect(() => () => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);
    }
  }, []);

  return (
    <motion.div
      className={styles.introLayer}
      data-pluto-intro-layer=""
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.55, ease: heroMotion.ease }}
      onPointerDown={onComplete}
    >
      <HeroParticleIntro onSequenceComplete={handleSequenceComplete} />
    </motion.div>
  );
}


