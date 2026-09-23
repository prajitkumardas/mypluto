"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import { cn } from "@/lib/utils";
import styles from "./progress-stepper.module.css";

type ProgressStep = {
  id: string;
  label: string;
};

type ProgressStepperProps = {
  className?: string;
  current: number;
  steps: readonly ProgressStep[];
};

export function ProgressStepper({ className, current, steps }: ProgressStepperProps) {
  const reduceMotion = useReducedMotionPreference();
  const activeStep = steps[current];

  if (!activeStep) return null;

  return (
    <div className={cn(styles.stepper, className)} aria-label={`Step ${current + 1} of ${steps.length}: ${activeStep.label}`}>
      <div className={styles.stepTrack} aria-hidden="true" style={{ "--step-count": steps.length } as CSSProperties}>
        {steps.map((step, index) => (
          <div className={styles.stepItem} data-state={index < current ? "complete" : index === current ? "active" : "upcoming"} key={step.id}>
            <span className={styles.stepCircle}>{index < current ? <Check /> : index + 1}</span>
            {index < steps.length - 1 ? (
              <span className={styles.stepConnector}>
                <motion.span animate={{ scaleX: index < current ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.26 }} />
              </span>
            ) : null}
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.mobileStepCopy}>
        <span>Step {current + 1} of {steps.length}</span>
        <strong>{activeStep.label}</strong>
      </div>
    </div>
  );
}
