"use client";

import type { ElementType, ReactNode } from "react";
import { Children, isValidElement, useMemo, useRef } from "react";
import type { HTMLMotionProps, MotionValue, Variants } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import { motionTokens } from "@/lib/motion/tokens";
import { useReducedMotionPreference } from "./use-reduced-motion-preference";

type RevealTag = "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "section" | "article";

type PlainRevealElement = ElementType<{ children?: ReactNode; className?: string } & Record<string, unknown>>;
type MotionRevealElement = ElementType<HTMLMotionProps<"div"> & { children?: ReactNode }>;

type CommonRevealProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
};

const motionElements = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  section: motion.section,
  article: motion.article
};

const plainElements: Record<RevealTag, ElementType> = {
  div: "div",
  span: "span",
  p: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  section: "section",
  article: "article"
};

const viewport = { once: true, amount: 0.2, margin: "0px 0px -12% 0px" };

export function SectionEyebrowReveal({ children, className, delay = 0, once = true }: CommonRevealProps) {
  const reducedMotion = useReducedMotionPreference();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -18 }}
      transition={{ duration: motionTokens.duration.normal, delay, ease: motionTokens.ease.premium }}
      viewport={{ ...viewport, once }}
      whileInView={{ opacity: 1, x: 0 }}
    >
      {children}
    </motion.div>
  );
}

type WordRevealProps = {
  as?: Extract<RevealTag, "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p">;
  className?: string;
  delay?: number;
  once?: boolean;
  text: string;
};

export function WordReveal({ as = "h2", className, delay = 0, once = true, text }: WordRevealProps) {
  const reducedMotion = useReducedMotionPreference();
  const units = useMemo(() => text.split(/(\s+)/), [text]);
  const PlainElement = plainElements[as] as PlainRevealElement;
  const MotionElement = motionElements[as] as MotionRevealElement;

  if (reducedMotion) {
    return <PlainElement className={className}>{text}</PlainElement>;
  }

  return (
    <MotionElement
      aria-label={text}
      className={className}
      initial="hidden"
      transition={{ staggerChildren: motionTokens.stagger.normal, delayChildren: delay }}
      variants={{ hidden: {}, visible: {} }}
      viewport={{ ...viewport, once }}
      whileInView="visible"
    >
      <span aria-hidden="true">
        {units.map((unit, index) => {
          if (/^\s+$/.test(unit)) return unit;

          return (
            <motion.span className="inline-block" key={`${unit}-${index}`} variants={wordVariants}>
              {unit}
            </motion.span>
          );
        })}
      </span>
    </MotionElement>
  );
}

type ContentBlockRevealProps = CommonRevealProps & {
  as?: Extract<RevealTag, "div" | "section" | "article" | "p">;
};

export function ContentBlockReveal({ as = "div", children, className, delay = 0, once = true }: ContentBlockRevealProps) {
  const reducedMotion = useReducedMotionPreference();
  const PlainElement = plainElements[as] as PlainRevealElement;
  const MotionElement = motionElements[as] as MotionRevealElement;

  if (reducedMotion) {
    return <PlainElement className={className}>{children}</PlainElement>;
  }

  return (
    <MotionElement
      className={className}
      initial="hidden"
      transition={{ duration: motionTokens.duration.slow, delay, ease: motionTokens.ease.premium }}
      variants={blockVariants}
      viewport={{ ...viewport, once }}
      whileInView="visible"
    >
      {children}
    </MotionElement>
  );
}

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

type RevealGroupProps = CommonRevealProps &
  DataAttributes & {
    as?: Extract<RevealTag, "div" | "section">;
    itemClassName?: string;
    stagger?: number;
  };

export function RevealGroup({
  as = "div",
  children,
  className,
  delay = 0,
  itemClassName,
  once = true,
  stagger = motionTokens.stagger.normal,
  ...props
}: RevealGroupProps) {
  const reducedMotion = useReducedMotionPreference();
  const PlainElement = plainElements[as] as PlainRevealElement;
  const MotionElement = motionElements[as] as MotionRevealElement;
  const childArray = Children.toArray(children).filter(isValidElement);

  if (reducedMotion) {
    return <PlainElement className={className} {...props}>{children}</PlainElement>;
  }

  return (
    <MotionElement
      className={className}
      {...props}
      initial="hidden"
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      variants={{ hidden: {}, visible: {} }}
      viewport={{ ...viewport, once }}
      whileInView="visible"
    >
      {childArray.map((child, index) => (
        <motion.div className={itemClassName} key={child.key ?? index} variants={blockVariants}>
          {child}
        </motion.div>
      ))}
    </MotionElement>
  );
}

type ScrollTextRevealProps = {
  as?: Extract<RevealTag, "p" | "h2" | "h3">;
  className?: string;
  mode?: "word" | "character";
  text: string;
  start?: string;
  end?: string;
  inactiveColor?: string;
  activeColor?: string;
  blur?: number;
};

export function ScrollTextReveal({
  as = "p",
  className,
  mode = "word",
  text,
  start = "start 82%",
  end = "end 38%",
  inactiveColor = "var(--text-reveal-muted)",
  activeColor = "var(--text-reveal-active)",
  blur = 1
}: ScrollTextRevealProps) {
  const reducedMotion = useReducedMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const units = useMemo(() => (mode === "character" ? Array.from(text) : text.split(/(\s+)/)), [mode, text]);
  const PlainElement = plainElements[as] as PlainRevealElement;
  const MotionElement = motionElements[as] as MotionRevealElement;
  const { scrollYProgress } = useScroll({ target: ref, offset: [start, end] as unknown as ["start 82%", "end 38%"] });
  const tokens = useMemo(() => {
    const indexedUnits = units.map((unit, index) => ({ index, isRevealable: Boolean(unit.trim()), unit }));
    const revealableIndexes = indexedUnits.filter((unit) => unit.isRevealable).map((unit) => unit.index);
    const revealableCount = revealableIndexes.length;

    return indexedUnits.map((unit) => {
      if (!unit.isRevealable) return { unit: unit.unit, index: unit.index, range: null };

      const revealableIndex = revealableIndexes.indexOf(unit.index);
      const startProgress = revealableCount <= 1 ? 0 : revealableIndex / revealableCount;
      const endProgress = revealableCount <= 1 ? 1 : Math.min(1, (revealableIndex + 1.7) / revealableCount);

      return { unit: unit.unit, index: unit.index, range: [startProgress, endProgress] as [number, number] };
    });
  }, [units]);

  if (reducedMotion) {
    return <PlainElement className={className}>{text}</PlainElement>;
  }

  return (
    <MotionElement aria-label={text} className={className}>
      <span aria-hidden="true" ref={ref}>
        {tokens.map((token) => {
          if (!token.range) return token.unit;

          return (
            <ScrollRevealUnit
              activeColor={activeColor}
              blur={blur}
              inactiveColor={inactiveColor}
              key={`${token.unit}-${token.index}`}
              progress={scrollYProgress}
              range={token.range}
            >
              {token.unit}
            </ScrollRevealUnit>
          );
        })}
      </span>
    </MotionElement>
  );
}

function ScrollRevealUnit({
  activeColor,
  blur,
  children,
  inactiveColor,
  progress,
  range
}: {
  activeColor: string;
  blur: number;
  children: string;
  inactiveColor: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, [inactiveColor, activeColor]);
  const filter = useTransform(progress, range, [`blur(${blur}px)`, "blur(0px)"]);

  return (
    <motion.span className="inline" style={{ color, filter }}>
      {children}
    </motion.span>
  );
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.medium, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.ease.premium }
  }
};

const blockVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.ease.premium }
  }
};