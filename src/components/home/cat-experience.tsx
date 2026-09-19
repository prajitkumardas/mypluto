"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef } from "react";
import { CatParticles } from "./cat-particles";
import styles from "./pluto-hero.module.css";

const REVEAL_EASING = {
  enterMs: 70,
  exitMs: 95,
  followMs: 70
};

type CatExperienceProps = {
  reduceMotion: boolean;
  visible: boolean;
};

function canHoverPrecisely() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function CatExperience({ reduceMotion, visible }: CatExperienceProps) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.985, y: visible ? 0 : 18 }}
      className={styles.catExperience}
      initial={false}
      transition={{ delay: visible ? 0.28 : 0, duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <CatParticles />
      <CatReveal reduceMotion={reduceMotion} />
    </motion.div>
  );
}

function CatReveal({ reduceMotion }: { reduceMotion: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const activeRef = useRef(false);
  const currentRef = useRef({ radius: 0, x: 0, y: 0 });
  const targetRef = useRef({ radius: 0, x: 0, y: 0 });

  const stopLoop = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const runLoop = (time: number) => {
    const root = rootRef.current;
    if (!root) {
      frameRef.current = null;
      return;
    }

    const current = currentRef.current;
    const target = targetRef.current;
    const elapsed = lastFrameTimeRef.current === 0 ? 16 : Math.min(64, time - lastFrameTimeRef.current);
    lastFrameTimeRef.current = time;
    const followAmount = 1 - Math.exp(-elapsed / REVEAL_EASING.followMs);
    const radiusAmount = 1 - Math.exp(-elapsed / (activeRef.current ? REVEAL_EASING.enterMs : REVEAL_EASING.exitMs));
    current.x += (target.x - current.x) * followAmount;
    current.y += (target.y - current.y) * followAmount;
    current.radius += (target.radius - current.radius) * radiusAmount;

    const wobble = activeRef.current ? Math.sin(time / 280) * Math.min(current.radius * 0.035, 4) : 0;
    root.style.setProperty("--cat-spot-x", `${current.x}px`);
    root.style.setProperty("--cat-spot-y", `${current.y}px`);
    root.style.setProperty("--cat-spot-radius", `${Math.max(0, current.radius)}px`);
    root.style.setProperty("--cat-spot-wobble", `${wobble}px`);

    const isSettled =
      !activeRef.current &&
      current.radius < 0.45 &&
      Math.abs(target.x - current.x) < 0.4 &&
      Math.abs(target.y - current.y) < 0.4;

    if (isSettled) {
      current.radius = 0;
      root.style.setProperty("--cat-spot-radius", "0px");
      root.removeAttribute("data-revealing");
      lastFrameTimeRef.current = 0;
      frameRef.current = null;
      return;
    }

    frameRef.current = window.requestAnimationFrame(runLoop);
  };

  const startLoop = () => {
    if (reduceMotion || frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(runLoop);
  };

  const syncPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, event.clientX - rect.left));
    const y = Math.min(rect.height, Math.max(0, event.clientY - rect.top));
    const radius = Math.min(130, Math.max(86, rect.width * 0.2));
    targetRef.current = { radius, x, y };

    if (currentRef.current.x === 0 && currentRef.current.y === 0) {
      currentRef.current.x = x;
      currentRef.current.y = y;
    }
  };

  const activate = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    if (event.pointerType !== "touch" && !canHoverPrecisely()) return;
    syncPointer(event);
    activeRef.current = true;
    rootRef.current?.setAttribute("data-revealing", "true");
    startLoop();
  };

  const deactivate = () => {
    activeRef.current = false;
    targetRef.current.radius = 0;
    startLoop();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    if (event.pointerType === "touch" && !activeRef.current) return;
    if (event.pointerType !== "touch" && !canHoverPrecisely()) return;
    syncPointer(event);
    if (!activeRef.current) activeRef.current = true;
    startLoop();
  };

  useEffect(() => stopLoop, []);

  return (
    <div
      aria-hidden="true"
      className={styles.catReveal}
      onPointerCancel={deactivate}
      onPointerDown={activate}
      onPointerEnter={activate}
      onPointerLeave={deactivate}
      onPointerMove={handlePointerMove}
      onPointerUp={deactivate}
      ref={rootRef}
    >
      <Image
        alt=""
        className={styles.catImage}
        fill
        priority
        sizes="(max-width: 767px) 82vw, (max-width: 1180px) 48vw, 40vw"
        src="/images/home/hero/pluto-cat-dark-clean.png"
      />
      <Image
        alt=""
        className={`${styles.catImage} ${styles.catImageLight}`}
        fill
        priority
        sizes="(max-width: 767px) 82vw, (max-width: 1180px) 48vw, 40vw"
        src="/images/home/hero/pluto-cat-light-clean.png"
      />
    </div>
  );
}
