"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { markIntroAsSeen, useGlobalLoading } from "./loading-provider";
import styles from "./route-loading-fallback.module.css";

export function RouteLoadingFallback() {
  const pathname = usePathname();
  const { active, registerRouteFallback, releaseRouteFallback } = useGlobalLoading();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (isLandingPage) return;

    markIntroAsSeen();
    registerRouteFallback();
    return releaseRouteFallback;
  }, [isLandingPage, registerRouteFallback, releaseRouteFallback]);

  return isLandingPage || active ? null : (
    <div aria-label="Loading page" aria-live="polite" className={styles.root} role="status">
      <span aria-hidden="true" className={styles.orbit}><i /></span>
      <span className={styles.label}>Loading Pluto Finds…</span>
    </div>
  );
}
