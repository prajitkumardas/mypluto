"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import type { CSSProperties, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

type SplitTextProps = {
  id?: string;
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | gsap.EaseFunction;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: CSSProperties["textAlign"];
  reducedMotion?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
  revealStart?: number;
  revealEnd?: number;
  onLetterAnimationComplete?: () => void;
};

export function SplitText({
  id,
  text,
  className = "",
  delay = 28,
  duration = 1.2,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  tag = "p",
  textAlign = "left",
  reducedMotion = false,
  triggerRef,
  revealStart = 0.33,
  revealEnd = 0.82,
  onLetterAnimationComplete
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document) || document.fonts.status === "loaded") {
      const timer = window.setTimeout(() => setFontsLoaded(true), 0);
      return () => window.clearTimeout(timer);
    }

    let mounted = true;
    void document.fonts.ready.then(() => {
      if (mounted) setFontsLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      const trigger = triggerRef?.current ?? el;

      if (!el || !text || !fontsLoaded || reducedMotion) return;

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        aria: "auto"
      });

      let targets: Element[] = [];
      if (splitType.includes("chars") && splitInstance.chars.length) targets = splitInstance.chars;
      if (!targets.length && splitType.includes("words") && splitInstance.words.length) targets = splitInstance.words;
      if (!targets.length && splitType.includes("lines") && splitInstance.lines.length) targets = splitInstance.lines;
      if (!targets.length) targets = splitInstance.chars.length ? splitInstance.chars : splitInstance.words;

      const scrollDistance = () => {
        if (!trigger || trigger === el) return window.innerHeight;
        return Math.max(trigger.offsetHeight - window.innerHeight, window.innerHeight);
      };

      gsap.set(targets, { ...from });
      el.dataset.splitState = "ready";

      const tween = gsap.to(
        targets,
        {
          ...to,
          duration,
          ease,
          force3D: true,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger,
            start: () => `top+=${scrollDistance() * revealStart} top`,
            end: () => `top+=${scrollDistance() * revealEnd} top`,
            scrub: 0.45,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            anticipatePin: 0.4
          },
          onComplete: () => onCompleteRef.current?.()
        }
      );

      ScrollTrigger.refresh();

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        splitInstance.revert();
        el.dataset.splitState = reducedMotion ? "ready" : "pending";
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        fontsLoaded,
        reducedMotion,
        revealStart,
        revealEnd
      ],
      revertOnUpdate: true,
      scope: ref
    }
  );

  const setSplitTextRef = (node: HTMLElement | null) => {
    ref.current = node;
  };
  const splitTextStyle: CSSProperties = {
    textAlign,
    wordWrap: "break-word",
    willChange: "transform, opacity"
  };
  const splitTextProps = {
    "aria-label": text,
    "data-split-state": reducedMotion ? "ready" : "pending",
    className,
    id,
    ref: setSplitTextRef,
    style: splitTextStyle
  };

  switch (tag) {
    case "h1":
      return <h1 {...splitTextProps}>{text}</h1>;
    case "h2":
      return <h2 {...splitTextProps}>{text}</h2>;
    case "h3":
      return <h3 {...splitTextProps}>{text}</h3>;
    case "h4":
      return <h4 {...splitTextProps}>{text}</h4>;
    case "h5":
      return <h5 {...splitTextProps}>{text}</h5>;
    case "h6":
      return <h6 {...splitTextProps}>{text}</h6>;
    case "span":
      return <span {...splitTextProps}>{text}</span>;
    default:
      return <p {...splitTextProps}>{text}</p>;
  }
}
