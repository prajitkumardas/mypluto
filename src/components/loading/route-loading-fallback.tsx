"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { markIntroAsSeen, useGlobalLoading } from "./loading-provider";
import { GlobalLoader } from "./global-loader";

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

  return isLandingPage || active ? null : <GlobalLoader />;
}
