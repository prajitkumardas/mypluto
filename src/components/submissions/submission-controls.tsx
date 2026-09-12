"use client";

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
      <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} autoFocus={autoFocus} inputMode={inputMode} name={name} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
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
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} name={name} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{placeholder}</option>
        {normalized.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error ? <small className={styles.fieldError} id={errorId} role="alert">{error}</small> : null}
    </label>
  );
}

export function StepHeading({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <header className={styles.stepHeading}><span className={styles.stepIcon}>{icon}</span><div><h2>{title}</h2><p>{copy}</p></div></header>;
}
