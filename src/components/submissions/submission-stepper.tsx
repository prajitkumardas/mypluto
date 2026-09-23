import { ProgressStepper } from "@/components/ui/progress-stepper";
import { submissionSteps } from "./types";
import styles from "./submit-tool-modal.module.css";

export function SubmissionStepper({ current }: { current: number }) {
  return <ProgressStepper className={styles.stepper} current={current} steps={submissionSteps} />;
}
