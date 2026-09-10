"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { MouseEventHandler, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./pluto-button.module.css";

export interface PlutoButtonProps {
  children?: ReactNode;
  text?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  target?: "_self" | "_blank";
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

const TRACKING = {
  easing: 0.12,
  fadeOutMs: 240
};

function canTrackPointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function PlutoButton({
  ariaLabel,
  children,
  className,
  disabled = false,
  fullWidth = false,
  href,
  loading = false,
  onClick,
  showArrow = false,
  size = "md",
  target = "_self",
  text,
  title,
  type = "button",
  variant = "primary"
}: PlutoButtonProps) {
  const rootRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const targetMouseXRef = useRef(0);
  const smoothMouseXRef = useRef(0);
  const widthRef = useRef(1);
  const activeRef = useRef(false);
  const inactive = disabled || loading;
  const label = children ?? text;

  const stopLoop = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const runLoop = () => {
    const root = rootRef.current;
    if (!root) return;

    smoothMouseXRef.current += (targetMouseXRef.current - smoothMouseXRef.current) * TRACKING.easing;

    const width = Math.max(widthRef.current, 1);
    const normX = Math.min(1, Math.max(0, smoothMouseXRef.current / width));
    const edgeProximity = Math.pow(Math.min(1, Math.abs(normX - 0.5) * 2), 1.6);
    const leftEdge = normX < 0.5 ? edgeProximity : 0;
    const rightEdge = normX > 0.5 ? edgeProximity : 0;

    root.style.setProperty("--pluto-cta-x", `${smoothMouseXRef.current}px`);
    root.style.setProperty("--pluto-cta-norm-x", `${normX}`);
    root.style.setProperty("--pluto-cta-edge-left", `${leftEdge}`);
    root.style.setProperty("--pluto-cta-edge-right", `${rightEdge}`);

    if (activeRef.current || Math.abs(targetMouseXRef.current - smoothMouseXRef.current) > 0.5) {
      animationFrameRef.current = window.requestAnimationFrame(runLoop);
    } else {
      stopLoop();
    }
  };

  const startLoop = () => {
    if (!animationFrameRef.current) {
      animationFrameRef.current = window.requestAnimationFrame(runLoop);
    }
  };

  const clearStopTimer = () => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const syncPointer = (event: PointerEvent<HTMLElement>) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    widthRef.current = rect.width;
    targetMouseXRef.current = Math.min(rect.width, Math.max(0, event.clientX - rect.left));
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (inactive || event.pointerType === "touch" || !canTrackPointer()) return;

    clearStopTimer();
    syncPointer(event);
    smoothMouseXRef.current = targetMouseXRef.current;
    activeRef.current = true;
    rootRef.current?.setAttribute("data-hovering", "true");
    startLoop();
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!activeRef.current || inactive || event.pointerType === "touch") return;
    syncPointer(event);
  };

  const handlePointerLeave = () => {
    activeRef.current = false;
    targetMouseXRef.current = widthRef.current / 2;
    rootRef.current?.removeAttribute("data-hovering");
    clearStopTimer();
    stopTimerRef.current = window.setTimeout(stopLoop, TRACKING.fadeOutMs);
    startLoop();
  };

  useEffect(() => {
    if (!inactive) return;
    activeRef.current = false;
    rootRef.current?.removeAttribute("data-hovering");
    stopLoop();
  }, [inactive]);

  useEffect(() => {
    return () => {
      clearStopTimer();
      stopLoop();
    };
  }, []);

  const classNames = cn(
    styles.root,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    inactive && styles.inactive,
    className
  );

  const content = (
    <>
      <span className={styles.outerGlow} aria-hidden="true" />
      <span className={styles.edgeGlow} aria-hidden="true" />
      <span className={styles.cursorGlow} aria-hidden="true" />
      <span className={styles.content}>
        {loading ? <Loader2 aria-hidden="true" className={styles.spinner} /> : null}
        <span className={styles.label}>{label}</span>
        {showArrow ? <ArrowRight aria-hidden="true" className={styles.arrow} strokeWidth={2.35} /> : null}
      </span>
    </>
  );

  const setRootNode = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
    rootRef.current = node;
  };

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
  };

  const commonProps = {
    "aria-busy": loading || undefined,
    "aria-disabled": inactive || undefined,
    "aria-label": ariaLabel,
    className: classNames,
    "data-loading": loading ? "true" : undefined,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerMove: handlePointerMove,
    title
  };

  if (href) {
    const rel = target === "_blank" ? "noopener noreferrer" : undefined;
    const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (inactive) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    if (isExternalHref(href)) {
      return (
        <a {...commonProps} ref={setRootNode} href={inactive ? undefined : href} onClick={handleLinkClick} rel={rel} target={target} tabIndex={inactive ? -1 : undefined}>
          {content}
        </a>
      );
    }

    return (
      <Link {...commonProps} ref={setRootNode} href={href} onClick={handleLinkClick} target={target} tabIndex={inactive ? -1 : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button {...commonProps} ref={setRootNode} disabled={inactive} onClick={handleButtonClick} type={type}>
      {content}
    </button>
  );
}
