"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isSearchRoute = pathname === "/search";

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="route-transition-shell"
      initial={{ opacity: 0, scale: isSearchRoute ? 0.985 : 1, y: isSearchRoute ? 0 : 6 }}
      key={pathname}
      transition={{ duration: reduceMotion ? 0.01 : isSearchRoute ? 0.42 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
