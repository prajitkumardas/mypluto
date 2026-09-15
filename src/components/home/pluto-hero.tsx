"use client";

import Image from "next/image";
import type { MotionValue } from "motion/react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "motion/react";
import { Mouse } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { GlobalLoader } from "@/components/loading/global-loader";
import MoltenMetal from "@/components/MoltenMetal";
import { PlutoButton } from "@/components/ui/pluto-button";
import { HeroParticleIntro } from "./hero-particle-intro";
import { HeroSearch } from "./hero-search";
import styles from "./pluto-hero.module.css";

const HERO_INTRO_STORAGE_KEY = "pluto_intro_seen";
const HOME_SEARCH_HASH = "#home-search";
const HOME_SEARCH_EVENT = "pluto:focus-home-search";
const heroMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  introFallbackDuration: 7.2
};
type IntroMode = "first-visit" | "pending" | "reload";

const subscribeToIntroMode = () => () => {};
const getClientIntroModeSnapshot = (): IntroMode =>
  document.documentElement.dataset.plutoLandingReload === "true" ? "reload" : "first-visit";
const getServerIntroModeSnapshot = (): IntroMode => "pending";

function mapScrollRange(value: number, start: number, end: number, from: number, to: number) {
  const progress = Math.min(Math.max((value - start) / (end - start), 0), 1);
  return from + (to - from) * progress;
}

export function PlutoHero() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(false);
  const [searchInteractive, setSearchInteractive] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 65, damping: 26, mass: 1 });
  const smoothY = useSpring(pointerY, { stiffness: 65, damping: 26, mass: 1 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const catScale = useTransform(scrollYProgress, [0, 0.28, 0.55, 0.8, 1], [1, 1.03, 1.16, 1.22, 1.26]);
  const catOpacity = useTransform(scrollYProgress, [0, 0.42, 0.68, 1], [1, 1, 0.72, 0.48]);
  const catY = useTransform(scrollYProgress, [0, 0.48, 1], [0, 20, 46]);
  const catFilter = useTransform(
    scrollYProgress,
    [0, 0.32, 0.56, 0.78, 1],
    ["blur(0px) brightness(1)", "blur(3px) brightness(0.94)", "blur(12px) brightness(0.82)", "blur(20px) brightness(0.74)", "blur(26px) brightness(0.7)"]
  );
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
  const searchOpacity = useTransform(scrollYProgress, (value) => mapScrollRange(value, 0.42, 0.6, 0, 1));
  const searchY = useTransform(scrollYProgress, (value) => mapScrollRange(value, 0.38, 0.6, 64, 0));
  const searchScale = useTransform(scrollYProgress, (value) => mapScrollRange(value, 0.4, 0.6, 0.94, 1));

  const glowAX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const glowAY = useTransform(smoothY, [-1, 1], [-8, 8]);
  const glowBX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const glowBY = useTransform(smoothY, [-1, 1], [-14, 14]);
  const glowCX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const glowCY = useTransform(smoothY, [-1, 1], [-22, 22]);

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

  const scrollToHeroSearch = useCallback(() => {
    finishIntro();

    const hero = heroRef.current;
    if (!hero) return;

    const heroTop = window.scrollY + hero.getBoundingClientRect().top;
    const scrollDistance = Math.max(hero.offsetHeight - window.innerHeight, 0);
    const targetY = heroTop + scrollDistance * 0.66;

    setSearchInteractive(true);
    window.scrollTo({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: targetY
    });
  }, [finishIntro, prefersReducedMotion]);

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
    const requestHomeSearch = () => {
      window.requestAnimationFrame(scrollToHeroSearch);
    };

    const handleHashChange = () => {
      if (window.location.hash === HOME_SEARCH_HASH) {
        requestHomeSearch();
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener(HOME_SEARCH_EVENT, requestHomeSearch);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener(HOME_SEARCH_EVENT, requestHomeSearch);
    };
  }, [scrollToHeroSearch]);

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
    setSearchInteractive(value >= 0.6);
    const replayLandingIntro = document.documentElement.dataset.plutoLandingReload === "true";
    if (!introComplete && !replayLandingIntro && value > 0.02) {
      finishIntro();
    }
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <section className={styles.hero} ref={heroRef} onPointerMove={handlePointerMove} aria-labelledby="home-hero-title">
      <div className={styles.heroSticky}>
        {!prefersReducedMotion && introComplete ? (
          <div aria-hidden="true" className={styles.moltenLayer}>
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
          </div>
        ) : null}

        <HeroGlow
          scale={glowScale}
          layerA={{ x: glowAX, y: glowAY }}
          layerB={{ x: glowBX, y: glowBY }}
          layerC={{ x: glowCX, y: glowCY }}
        />

        {!introComplete ? <HeroIntro onComplete={finishIntro} /> : null}

        <motion.div
          aria-hidden="true"
          className={styles.catLayer}
          style={{ scale: prefersReducedMotion ? 1 : catScale, opacity: prefersReducedMotion ? 1 : catOpacity, y: prefersReducedMotion ? 0 : catY, filter: prefersReducedMotion ? "none" : catFilter }}
        >
          <motion.div
            animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 52, scale: introComplete ? 1 : 0.92 }}
            className={styles.catReveal}
            initial={false}
            transition={{ duration: 1.08, ease: heroMotion.ease }}
          >
            <Image
              alt=""
              className={styles.catImage}
              height={1400}
              priority
              sizes="(max-width: 767px) 88vw, (max-width: 1180px) 58vw, 38vw"
              src="/images/home/hero/pluto-cat-mascot.png"
              width={1400}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.greetingState}
          style={{ opacity: prefersReducedMotion ? 1 : greetingOpacity, y: prefersReducedMotion ? 0 : greetingY }}
        >
          <motion.div
            animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 18 }}
            initial={false}
            transition={{ duration: 0.82, delay: introComplete ? 0.22 : 0, ease: heroMotion.ease }}
          >
            <p className={styles.greetingEyebrow}>Hey buddy,<span aria-hidden="true">{"\uD83D\uDC4B"}</span></p>
            <h1 className={styles.greetingTitle} id="home-hero-title">Great to have you here!</h1>
            <div className={styles.greetingActions}>
              <PlutoButton href="/plutos-library" showArrow size="lg" variant="primary">
                Discover AI Tools
              </PlutoButton>
              <PlutoButton href="/play" showArrow size="lg" variant="secondary">
                Play with Me
              </PlutoButton>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.scrollCue}
          style={{ opacity: prefersReducedMotion ? 0 : cueOpacity }}
          aria-hidden="true"
        >
          <Mouse className={styles.scrollCueIcon} />
        </motion.div>

        <motion.div
          className={styles.searchState}
          style={{ opacity: prefersReducedMotion ? 1 : searchOpacity, y: prefersReducedMotion ? 0 : searchY, scale: prefersReducedMotion ? 1 : searchScale, pointerEvents: searchInteractive || prefersReducedMotion ? "auto" : "none" }}
        >
          <div className={styles.searchContent}>
            <p className={styles.searchGreeting}>Hey buddy, great to have you here!</p>
            <p className={styles.searchTitle}>Let&apos;s Find your perfect AI tool.</p>
            <div className={styles.searchShell}>
              <HeroSearch />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type HeroGlowProps = {
  scale: MotionValue<number>;
  layerA: { x: MotionValue<number>; y: MotionValue<number> };
  layerB: { x: MotionValue<number>; y: MotionValue<number> };
  layerC: { x: MotionValue<number>; y: MotionValue<number> };
};

function HeroGlow({ scale, layerA, layerB, layerC }: HeroGlowProps) {
  return (
    <motion.div className={styles.glowField} style={{ scale }} aria-hidden="true">
      <motion.div className={styles.glowA} style={{ x: layerA.x, y: layerA.y }} />
      <motion.div className={styles.glowB} style={{ x: layerB.x, y: layerB.y }} />
      <motion.div className={styles.glowC} style={{ x: layerC.x, y: layerC.y }} />
    </motion.div>
  );
}

function HeroIntro({ onComplete }: { onComplete: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(14);
  const introMode = useSyncExternalStore(
    subscribeToIntroMode,
    getClientIntroModeSnapshot,
    getServerIntroModeSnapshot
  );
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

  useEffect(() => {
    if (introMode !== "reload") return;

    const timers = [
      window.setTimeout(() => setProgress(34), 280),
      window.setTimeout(() => setProgress(58), 1_180),
      window.setTimeout(() => setProgress(78), 2_300),
      window.setTimeout(() => setProgress(92), 3_350),
      window.setTimeout(() => setProgress(100), 4_050),
      window.setTimeout(handleSequenceComplete, 4_280)
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [handleSequenceComplete, introMode]);

  return (
    <motion.div
      className={styles.introLayer}
      data-pluto-intro-layer=""
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.55, ease: heroMotion.ease }}
      onPointerDown={onComplete}
    >
      <div className={styles.firstVisitIntro}>
        {introMode !== "reload" ? (
          <HeroParticleIntro onSequenceComplete={handleSequenceComplete} />
        ) : null}
      </div>

      <div className={styles.reloadIntro}>
        {introMode === "first-visit"
          ? null
          : introMode === "reload"
            ? createPortal(
                <GlobalLoader exiting={isExiting} mode="determinate" progress={progress} />,
                document.body
              )
            : <GlobalLoader exiting={isExiting} mode="determinate" progress={progress} />}
      </div>
    </motion.div>
  );
}


