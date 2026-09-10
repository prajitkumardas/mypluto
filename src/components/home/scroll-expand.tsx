"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./scroll-expand.module.css";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

type ConfigKey =
  | "startWidth"
  | "startHeight"
  | "startRadius"
  | "endRadius"
  | "mediaZoom"
  | "scrollDistance"
  | "holdDistance"
  | "smoothing"
  | "overlayScrim"
  | "useWindowScroll"
  | "enabled";

export interface ScrollExpandProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ScrollExpand({
  alt = "",
  children,
  className,
  enabled = true,
  endRadius = 0,
  holdDistance = 0.35,
  mediaType = "image",
  mediaZoom = 1.35,
  overlayScrim = 0.45,
  poster = "",
  scrollDistance = 1.2,
  scrollHint = "",
  smoothing = 0.1,
  src = "",
  startHeight = 58,
  startRadius = 24,
  startWidth = 42,
  style,
  title = "",
  useWindowScroll = false,
  ...rest
}: ScrollExpandProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const propsRef = useRef<Required<Pick<ScrollExpandProps, ConfigKey>>>({
    enabled,
    endRadius,
    holdDistance,
    mediaZoom,
    overlayScrim,
    scrollDistance,
    smoothing,
    startHeight,
    startRadius,
    startWidth,
    useWindowScroll
  });

  useEffect(() => {
    propsRef.current = {
      enabled,
      endRadius,
      holdDistance,
      mediaZoom,
      overlayScrim,
      scrollDistance,
      smoothing,
      startHeight,
      startRadius,
      startWidth,
      useWindowScroll
    };
  }, [enabled, endRadius, holdDistance, mediaZoom, overlayScrim, scrollDistance, smoothing, startHeight, startRadius, startWidth, useWindowScroll]);

  const applyProgress = useCallback((progress: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;

    const config = propsRef.current;
    const eased = smoothstep(0, 1, progress);
    const width = config.startWidth + (100 - config.startWidth) * eased;
    const height = config.startHeight + (100 - config.startHeight) * eased;
    const insetX = Math.max(0, (100 - width) / 2);
    const insetY = Math.max(0, (100 - height) / 2);
    const radius = config.startRadius + (config.endRadius - config.startRadius) * eased;

    frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
    media.style.transform = `scale(${config.mediaZoom + (1 - config.mediaZoom) * eased})`;

    if (scrimRef.current) {
      scrimRef.current.style.opacity = `${config.overlayScrim * eased}`;
    }

    if (titleRef.current) {
      const out = smoothstep(0.34, 0.82, progress);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-26 * out}px, 0) scale(${1 + 0.04 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, progress);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const entered = smoothstep(0.62, 1, progress);
      overlayRef.current.style.opacity = `${entered}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - entered)}px, 0)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let current = reduceMotion ? 1 : 0;
    let target = current;
    let stageHeight = 0;
    let running = false;

    const measure = () => {
      const config = propsRef.current;
      stageHeight = config.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageHeight <= 0) return;

      stage.style.height = `${stageHeight}px`;
      track.style.height = reduceMotion
        ? `${stageHeight}px`
        : `${stageHeight * (1 + Math.max(0, config.scrollDistance) + Math.max(0, config.holdDistance))}px`;

      const width = root.clientWidth || stageHeight;
      stage.style.setProperty("--se-title-size", `${clamp(width * 0.075, 28, 88)}px`);
    };

    const readProgress = () => {
      const config = propsRef.current;
      if (!config.enabled || reduceMotion) return 1;

      const span = stageHeight * Math.max(0.01, config.scrollDistance);
      if (config.useWindowScroll) {
        return clamp(-track.getBoundingClientRect().top / span, 0, 1);
      }

      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const config = propsRef.current;
      const easing = config.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * config.smoothing));
      current += (target - current) * easing;

      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }

      applyProgress(current);
      animationFrame = running ? window.requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const handleResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = propsRef.current.useWindowScroll ? window : root;
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(root);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [applyProgress]);

  const setMediaRef = (node: HTMLImageElement | HTMLVideoElement | null) => {
    mediaRef.current = node;
  };

  const media = mediaType === "video" ? (
    <video
      className={styles.media}
      loop
      muted
      playsInline
      poster={poster}
      ref={setMediaRef}
      src={src}
      autoPlay
    />
  ) : (
    <Image
      alt={alt}
      className={styles.media}
      draggable={false}
      fill
      priority
      ref={setMediaRef}
      sizes="100vw"
      src={src}
    />
  );

  return (
    <div
      {...rest}
      className={cn(styles.root, useWindowScroll && styles.windowScroll, className)}
      ref={rootRef}
      style={style}
    >
      <div className={styles.track} ref={trackRef}>
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.frame} ref={frameRef}>
            {media}
            <div aria-hidden="true" className={styles.scrim} ref={scrimRef} />
            {children ? (
              <div className={styles.overlay} ref={overlayRef}>
                {children}
              </div>
            ) : null}
          </div>

          {title ? (
            <div aria-hidden="true" className={styles.title} ref={titleRef}>
              {title}
            </div>
          ) : null}

          {scrollHint ? (
            <div aria-hidden="true" className={styles.hint} ref={hintRef}>
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ScrollExpand;