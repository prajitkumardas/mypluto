import { BookOpen, Compass, Gamepad2, GitCompareArrows, TrendingUp, type LucideIcon } from "lucide-react";

export type PrimaryRoute = {
  href: string;
  label: string;
  longLabel: string;
  icon: LucideIcon;
};

export const primaryRoutes: PrimaryRoute[] = [
  { href: "/plutos-library", label: "Discover", longLabel: "Discover", icon: Compass },
  { href: "/pluto-guides", label: "Guides", longLabel: "Pluto Guides", icon: BookOpen },
  { href: "/trending", label: "Trending", longLabel: "Trending", icon: TrendingUp },
  { href: "/compare", label: "Compare", longLabel: "Compare", icon: GitCompareArrows },
  { href: "/play", label: "Play", longLabel: "Play", icon: Gamepad2 }
];

export function getActivePrimaryRoute(pathname: string) {
  if (pathname === "/tools" || pathname.startsWith("/tools/") || pathname.startsWith("/plutos-library")) {
    return primaryRoutes[0];
  }

  return primaryRoutes.find((route) => pathname === route.href || pathname.startsWith(`${route.href}/`));
}
