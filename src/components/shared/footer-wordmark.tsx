"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import styles from "./site-footer.module.css";

const START_X = 50;
const START_Y = 50;

export function FooterWordmark() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const currentRef = useRef({ x: START_X, y: START_Y });
  const targetRef = useRef({ x: START_X, y: START_Y });
  const reduceMotion = useReducedMotionPreference();

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  const renderSpotlight = () => {
    const element = linkRef.current;
    if (!element) {
      frameRef.current = null;
      return;
    }

    const current = currentRef.current;
    const target = targetRef.current;
    const ease = reduceMotion ? 1 : 0.18;
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    element.style.setProperty("--spot-x", `${current.x.toFixed(2)}%`);
    element.style.setProperty("--spot-y", `${current.y.toFixed(2)}%`);

    if (Math.abs(target.x - current.x) > 0.08 || Math.abs(target.y - current.y) > 0.08) {
      frameRef.current = window.requestAnimationFrame(renderSpotlight);
    } else {
      frameRef.current = null;
    }
  };

  const scheduleSpotlight = () => {
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(renderSpotlight);
  };

  return (
    <Link
      aria-label="Pluto Finds home"
      className={styles.wordmarkLink}
      href="/"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        event.currentTarget.dataset.hovered = "true";
      }}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.hovered = "false";
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        targetRef.current = {
          x: ((event.clientX - bounds.left) / bounds.width) * 100,
          y: ((event.clientY - bounds.top) / bounds.height) * 100
        };
        scheduleSpotlight();
      }}
      ref={linkRef}
    >
      <span aria-hidden="true" className={styles.wordmarkBase}>PlutoFinds</span>
      <span aria-hidden="true" className={styles.wordmarkHighlight}>PlutoFinds</span>
    </Link>
  );
}
