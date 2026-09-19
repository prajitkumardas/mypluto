"use client";

import { usePathname } from "next/navigation";
import { InsidePageFooter } from "./inside-page-footer";
import { SiteFooter } from "./site-footer";

const insidePagePrefixes = [
  "/plutos-library",
  "/tools",
  "/categories",
  "/collections",
  "/use-cases",
  "/for",
  "/pluto-guides",
  "/trending",
  "/compare"
] as const;

export function RouteSiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") return <SiteFooter />;

  const showInsideFooter = insidePagePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return showInsideFooter ? <InsidePageFooter /> : null;
}
