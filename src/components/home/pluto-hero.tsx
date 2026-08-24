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
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroSearch } from "./hero-search";
import LineWaves from "./line-waves";
import styles from "./pluto-hero.module.css";

type HeroPhase = "brand" | "greeting";

const HERO_INTRO_STORAGE_KEY = "pluto_intro_seen";
const HOME_SEARCH_HASH = "#home-search";
const HOME_SEARCH_EVENT = "pluto:focus-home-search";
const heroMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  introDuration: 3.15
};

export function PlutoHero() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<HeroPhase>("brand");
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
  const greetingOpacity = useTransform(scrollYProgress, [0, 0.1, 0.32, 0.46], [1, 1, 0.55, 0]);
  const greetingY = useTransform(scrollYProgress, [0, 0.46], [0, -48]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12, 0.28], [1, 0.8, 0]);
  const searchOpacity = useTransform(scrollYProgress, [0.38, 0.62], [0, 1]);
  const searchY = useTransform(scrollYProgress, [0.38, 0.62], [64, 0]);
  const searchScale = useTransform(scrollYProgress, [0.42, 0.62], [0.94, 1]);

  const glowAX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const glowAY = useTransform(smoothY, [-1, 1], [-8, 8]);
  const glowBX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const glowBY = useTransform(smoothY, [-1, 1], [-14, 14]);
  const glowCX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const glowCY = useTransform(smoothY, [-1, 1], [-22, 22]);

  const finishIntro = useCallback(() => {
    setPhase("greeting");
    setIntroComplete(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(HERO_INTRO_STORAGE_KEY, "true");
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

    const seenIntro = sessionStorage.getItem(HERO_INTRO_STORAGE_KEY) === "true";
    if (seenIntro) {
      const timer = window.setTimeout(finishIntro, 0);
      return () => window.clearTimeout(timer);
    }

    const timers = [
      window.setTimeout(() => setPhase("greeting"), 2250),
      window.setTimeout(finishIntro, heroMotion.introDuration * 1000)
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
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
    setSearchInteractive(value > 0.62);
    if (!introComplete && value > 0.02) {
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
        <HeroGlow
          scale={glowScale}
          layerA={{ x: glowAX, y: glowAY }}
          layerB={{ x: glowBX, y: glowBY }}
          layerC={{ x: glowCX, y: glowCY }}
        />

        {!prefersReducedMotion ? (
          <LineWaves
            className={styles.lineWavesLayer}
            speed={0.14}
            innerLineCount={32}
            outerLineCount={36}
            warpIntensity={1}
            rotation={-45}
            edgeFadeWidth={0}
            colorCycleSpeed={1}
            brightness={0.26}
            color1="#7a4cff"
            color2="#b9a7ff"
            color3="#5e35f2"
            enableMouseInteraction
            mouseInfluence={2}
          />
        ) : null}

        {!introComplete ? <HeroIntro phase={phase} onSkip={finishIntro} /> : null}

        <motion.div
          aria-hidden="true"
          className={styles.catLayer}
          initial={false}
          animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 52, scale: introComplete ? 1 : 0.92 }}
          transition={{ duration: 1.08, ease: heroMotion.ease }}
          style={{ scale: prefersReducedMotion ? 1 : catScale, opacity: prefersReducedMotion ? 1 : catOpacity, y: prefersReducedMotion ? 0 : catY, filter: prefersReducedMotion ? "none" : catFilter }}
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

        <motion.div
          className={styles.greetingState}
          initial={false}
          animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 18 }}
          transition={{ duration: 0.82, delay: 0.22, ease: heroMotion.ease }}
          style={{ opacity: prefersReducedMotion ? 1 : greetingOpacity, y: prefersReducedMotion ? 0 : greetingY }}
        >
          <p className={styles.greetingEyebrow}>Hey buddy,<span aria-hidden="true">{"\uD83D\uDC4B"}</span></p>
          <h1 className={styles.greetingTitle} id="home-hero-title">Great to have you here!</h1>
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
            <h2 className={styles.searchTitle}>Let&apos;s Find your perfect AI tool.</h2>
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

function HeroIntro({ phase, onSkip }: { phase: HeroPhase; onSkip: () => void }) {
  const isBrand = phase === "brand";
  const isGreeting = phase === "greeting";

  return (
    <motion.div
      className={styles.introLayer}
      initial={{ opacity: 1 }}
      animate={{ opacity: isGreeting ? 0 : 1 }}
      transition={{ duration: 0.55, ease: heroMotion.ease }}
      aria-hidden="true"
      onPointerDown={onSkip}
    >
      <motion.div
        className={styles.brandReveal}
        initial={{ clipPath: "inset(0 42% 0 42%)", filter: "blur(22px)", opacity: 0, scale: 0.74, y: 26 }}
        animate={{
          clipPath: isBrand || isGreeting ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
          filter: isGreeting ? "blur(20px)" : "blur(0px)",
          opacity: isBrand ? 1 : 0,
          scale: isGreeting ? 1.18 : 1,
          y: isGreeting ? -44 : 0
        }}
        transition={{ duration: isGreeting ? 0.82 : 1.05, ease: heroMotion.ease }}
      >
        Pluto Finds
      </motion.div>

      <button className={styles.skipIntro} type="button" onClick={(event) => { event.stopPropagation(); onSkip(); }}>
        Skip intro
      </button>
    </motion.div>
  );
}


