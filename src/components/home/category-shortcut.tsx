import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./pluto-hero.module.css";

type CategoryShortcutProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
};

export function CategoryShortcut({
  href,
  label,
  icon: Icon,
  className
}: CategoryShortcutProps) {
  return (
    <Link
      aria-label={`Browse ${label} AI tools`}
      className={cn(styles.shortcut, className)}
      href={href}
    >
      <span className={styles.shortcutIcon}>
        <Icon aria-hidden="true" />
      </span>
      <span className={styles.shortcutLabel}>{label}</span>
    </Link>
  );
}
