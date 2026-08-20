"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./pluto-hero.module.css";

export function InteractivePluto() {
  const frameRef = useRef<HTMLDivElement>(null);
  const hasFinePointerRef = useRef(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 90, damping: 20, mass: 0.35 });
  const smoothY = useSpring(y, { stiffness: 90, damping: 20, mass: 0.35 });
  const rotate = useTransform(smoothX, [-1, 1], [-1.4, 1.4]);
  const translateX = useTransform(smoothX, [-1, 1], [-5, 5]);
  const translateY = useTransform(smoothY, [-1, 1], [-2, 3]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const alreadyGreeted = sessionStorage.getItem("plutoHeroGreeted") === "true";
    if (alreadyGreeted) return;

    const showTimer = window.setTimeout(() => {
      setShowGreeting(true);
      sessionStorage.setItem("plutoHeroGreeted", "true");
    }, 420);
    const hideTimer = window.setTimeout(() => setShowGreeting(false), 3000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    hasFinePointerRef.current = window.matchMedia("(pointer: fine)").matches;
  }, []);

  return (
    <motion.div
      aria-label="Pluto, a realistic cat, waving hello"
      className={styles.plutoFrame}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onPointerMove={(event) => {
        if (!hasFinePointerRef.current || !frameRef.current) return;
        const rect = frameRef.current.getBoundingClientRect();
        const nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        x.set(Math.max(-1, Math.min(1, nextX)));
        y.set(Math.max(-1, Math.min(1, nextY)));
      }}
      ref={frameRef}
      role="img"
      style={{ rotate, x: translateX, y: translateY }}
      tabIndex={0}
    >
      <Image
        alt=""
        className={styles.plutoImage}
        fill
        priority
        sizes="(max-width: 767px) 210px, (max-width: 1199px) 250px, 310px"
        src="/images/home/hero/pluto-wave.png"
      />
      <motion.span
        aria-hidden={!showGreeting}
        className={styles.speechBubble}
        initial={false}
        animate={showGreeting ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        Hi buddy! 👋
      </motion.span>
      <span aria-hidden="true" className={styles.eyeGlint} />
    </motion.div>
  );
}
