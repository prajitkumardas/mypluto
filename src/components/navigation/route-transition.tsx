"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useReducedMotionPreference } from "@/components/motion/use-reduced-motion-preference";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotionPreference();
  const isSearchRoute = pathname === "/search";

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="route-transition-shell"
      id="main-content"
      initial={{ opacity: 0, scale: isSearchRoute ? 0.985 : 1, y: isSearchRoute ? 0 : 6 }}
      key={pathname}
      tabIndex={-1}
      transition={{ duration: reduceMotion ? 0.01 : isSearchRoute ? 0.42 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
