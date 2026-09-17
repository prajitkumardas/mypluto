"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";
import { submissionSteps } from "./types";
import styles from "./submit-tool-modal.module.css";

export function SubmissionStepper({ current }: { current: number }) {
  const reduceMotion = useReducedMotionPreference();
  return (
    <div className={styles.stepper} aria-label={`Step ${current + 1} of ${submissionSteps.length}: ${submissionSteps[current].label}`}>
      <div className={styles.stepTrack} aria-hidden="true">
        {submissionSteps.map((step, index) => (
          <div className={styles.stepItem} data-state={index < current ? "complete" : index === current ? "active" : "upcoming"} key={step.id}>
            <span className={styles.stepCircle}>{index < current ? <Check /> : index + 1}</span>
            {index < submissionSteps.length - 1 ? <span className={styles.stepConnector}><motion.span animate={{ scaleX: index < current ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.26 }} /></span> : null}
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.mobileStepCopy}>
        <span>Step {current + 1} of {submissionSteps.length}</span>
        <strong>{submissionSteps[current].label}</strong>
      </div>
    </div>
  );
}
