"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./pluto-hero.module.css";

type Direction = "center" | "left" | "right" | "up" | "down";

const POSES: Record<Direction, number> = {
  center: 0,
  left: 1,
  right: 3,
  up: 4,
  down: 6.5
};

const TRACKING = {
  deadZone: 0.1,
  easing: 0.07,
  returnEasing: 0.055,
  seekThreshold: 0.015,
  movementEpsilon: 0.006,
  maxOffsetX: 6,
  maxOffsetY: 4
};

const VIDEO_SRC = "/videos/pluto-mouse-tracking.mp4";
const POSTER_SRC = "/images/home/hero/pluto-cat-mascot.png";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

function resolvePoseTime(direction: Direction, duration: number) {
  const maxPoseTime = Math.max(...Object.values(POSES));
  const safeDuration = Number.isFinite(duration) && duration > 0 ? Math.max(0, duration - 0.04) : maxPoseTime;
  const poseTime = POSES[direction];

  return clamp(maxPoseTime > safeDuration ? poseTime * (safeDuration / maxPoseTime) : poseTime, 0, safeDuration);
}

function resolveTargetTime(x: number, y: number, duration: number) {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const dominant = Math.max(absX, absY);

  if (dominant < TRACKING.deadZone) {
    return resolvePoseTime("center", duration);
  }

  const direction: Direction = absX > absY ? (x < 0 ? "left" : "right") : y < 0 ? "up" : "down";
  const intensity = clamp((dominant - TRACKING.deadZone) / (1 - TRACKING.deadZone), 0, 1);
  const centerTime = resolvePoseTime("center", duration);
  const directionTime = resolvePoseTime(direction, duration);

  return lerp(centerTime, directionTime, intensity);
}

type PlutoMouseTrackerProps = {
  heroRef: RefObject<HTMLElement | null>;
};

export function PlutoMouseTracker({ heroRef }: PlutoMouseTrackerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationRef = useRef(POSES.down);
  const targetTimeRef = useRef(POSES.center);
  const currentTimeRef = useRef(POSES.center);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const smoothXRef = useRef(0);
  const smoothYRef = useRef(0);
  const pointerInsideRef = useRef(false);
  const trackingEnabledRef = useRef(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)");
    const syncTrackingPreference = () => {
      trackingEnabledRef.current = !mediaQuery.matches;
      if (mediaQuery.matches) {
        pointerInsideRef.current = false;
        targetXRef.current = 0;
        targetYRef.current = 0;
        targetTimeRef.current = resolvePoseTime("center", durationRef.current);
      }
    };

    syncTrackingPreference();
    mediaQuery.addEventListener("change", syncTrackingPreference);

    return () => mediaQuery.removeEventListener("change", syncTrackingPreference);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const frame = frameRef.current;
    const video = videoRef.current;

    if (!hero || !frame || !video || !videoReady) return;

    let running = true;

    const returnToCenter = () => {
      pointerInsideRef.current = false;
      targetXRef.current = 0;
      targetYRef.current = 0;
      targetTimeRef.current = resolvePoseTime("center", durationRef.current);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!trackingEnabledRef.current || event.pointerType === "touch") return;

      const rect = hero.getBoundingClientRect();
      const nextX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const nextY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

      if (
        Math.abs(nextX - targetXRef.current) < TRACKING.movementEpsilon &&
        Math.abs(nextY - targetYRef.current) < TRACKING.movementEpsilon
      ) {
        return;
      }

      pointerInsideRef.current = true;
      targetXRef.current = nextX;
      targetYRef.current = nextY;
      targetTimeRef.current = resolveTargetTime(nextX, nextY, durationRef.current);
    };

    const tick = () => {
      if (!running) return;

      const easing = pointerInsideRef.current ? TRACKING.easing : TRACKING.returnEasing;

      currentTimeRef.current += (targetTimeRef.current - currentTimeRef.current) * easing;
      smoothXRef.current += (targetXRef.current - smoothXRef.current) * easing;
      smoothYRef.current += (targetYRef.current - smoothYRef.current) * easing;

      frame.style.setProperty("--pluto-track-x", `${smoothXRef.current * TRACKING.maxOffsetX}px`);
      frame.style.setProperty("--pluto-track-y", `${smoothYRef.current * TRACKING.maxOffsetY}px`);

      if (Math.abs(video.currentTime - currentTimeRef.current) > TRACKING.seekThreshold) {
        video.currentTime = currentTimeRef.current;
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", returnToCenter);
    video.pause();
    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", returnToCenter);
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [heroRef, videoReady]);

  return (
    <div className={styles.catTracker} ref={frameRef}>
      <video
        aria-hidden="true"
        className={styles.catVideo}
        disablePictureInPicture
        muted
        onCanPlay={() => setVideoReady(true)}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const centerTime = resolvePoseTime("center", video.duration);

          durationRef.current = video.duration;
          targetTimeRef.current = centerTime;
          currentTimeRef.current = centerTime;
          video.currentTime = centerTime;
          video.pause();
        }}
        playsInline
        poster={POSTER_SRC}
        preload="auto"
        ref={videoRef}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
    </div>
  );
}