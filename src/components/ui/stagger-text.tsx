"use client";

import type { ElementType } from "react";
import { useMemo } from "react";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion } from "motion/react";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import styles from "./stagger-text.module.css";

type StaggerTextTag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type MotionTextElement = ElementType<HTMLMotionProps<"span"> & { children?: React.ReactNode }>;

type StaggerTextProps = {
  as?: StaggerTextTag;
  children: string | number;
  className?: string;
  delay?: number;
  divideBy?: "word" | "letter";
  id?: string;
};

const motionElements = {
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6
};

const itemVariants: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
  }
};

export function StaggerText({
  as = "span",
  children,
  className,
  delay = 0,
  divideBy = "word",
  id
}: StaggerTextProps) {
  const reduceMotion = useReducedMotionPreference();
  const text = String(children);
  const parts = useMemo(
    () => (divideBy === "letter" ? Array.from(text) : text.split(/(\s+)/)),
    [divideBy, text]
  );
  const MotionElement = motionElements[as] as MotionTextElement;
  const stagger = divideBy === "letter" ? 0.02 : 0.05;

  return (
    <MotionElement
      className={className}
      id={id}
      initial={false}
      variants={{ hidden: {}, show: { transition: { delayChildren: delay, staggerChildren: stagger } } }}
      viewport={{ amount: 0.2, margin: "0px 0px -8% 0px", once: true }}
      whileInView={reduceMotion ? undefined : "show"}
    >
      <span>
        {parts.map((part, index) => {
          if (divideBy === "word" && /^\s+$/.test(part)) return part;

          return (
            <span className={styles.mask} key={`${part}-${index}`}>
              <motion.span className={styles.item} variants={itemVariants}>
                {divideBy === "letter" && part === " " ? "\u00a0" : part}
              </motion.span>
            </span>
          );
        })}
      </span>
    </MotionElement>
  );
}

export default StaggerText;
