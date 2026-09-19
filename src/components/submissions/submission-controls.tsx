"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import styles from "./submit-tool-modal.module.css";

export function SubmissionField({ error, label, name, onChange, placeholder, type = "text", value, autoFocus, inputMode }: {
  autoFocus?: boolean;
  error?: string;
  inputMode?: "email" | "url" | "text";
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "url";
  value: string;
}) {
  const errorId = `${name}-error`;
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input className="pf-field-control" aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} autoFocus={autoFocus} inputMode={inputMode} name={name} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
      {error ? <small className={styles.fieldError} id={errorId} role="alert">{error}</small> : null}
    </label>
  );
}

export function SubmissionSelect({ error, label, name, onChange, options, placeholder, value }: {
  error?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: readonly string[] | Array<{ label: string; value: string }>;
  placeholder: string;
  value: string;
}) {
  const normalized = options.map((option) => typeof option === "string" ? { label: option, value: option } : option);
  const errorId = `${name}-error`;
  const labelId = `${name}-label`;
  return (
    <div className={styles.field}>
      <span id={labelId}>{label}</span>
      <Select.Root name={name} onValueChange={onChange} value={value}>
        <Select.Trigger className="pf-select-trigger" aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} aria-labelledby={labelId}>
          <Select.Value placeholder={placeholder} />
          <Select.Icon asChild>
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="pf-select-content z-[230] max-h-72" collisionPadding={16} position="popper" sideOffset={8}>
            <Select.Viewport className="p-1.5">
              {normalized.map((option) => (
                <Select.Item className="pf-select-item" key={option.value} value={option.value}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check aria-hidden="true" className="h-4 w-4 text-lime-300" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error ? <small className={styles.fieldError} id={errorId} role="alert">{error}</small> : null}
    </div>
  );
}

export function StepHeading({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <header className={styles.stepHeading}><span className={styles.stepIcon}>{icon}</span><div><h2>{title}</h2><p>{copy}</p></div></header>;
}
