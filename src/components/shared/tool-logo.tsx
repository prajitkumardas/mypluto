"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./tool-logo.module.css";

type ToolLogoProps = {
  className?: string;
  imageClassName?: string;
  name: string;
  src?: string | null;
};

export function ToolLogo({ className, imageClassName, name, src }: ToolLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = useMemo(() => getInitials(name), [name]);
  const logoSrc = src?.trim();
  const showLogo = Boolean(logoSrc && failedSrc !== logoSrc);

  return (
    <span className={cn(styles.root, className)}>
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${name} logo`}
          className={cn(styles.image, imageClassName)}
          decoding="async"
          loading="lazy"
          onError={() => setFailedSrc(logoSrc || null)}
          src={logoSrc}
        />
      ) : (
        <span aria-hidden="true" className={styles.fallback}>
          {initials}
        </span>
      )}
    </span>
  );
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}
