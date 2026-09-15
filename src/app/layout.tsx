import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense, type ReactNode } from "react";
import { LoadingProvider } from "@/components/loading/loading-provider";
import { ScrollReset } from "@/components/shared/scroll-reset";
import { SiteFooter } from "@/components/shared/site-footer";
import { accentFont, bodyFont, displayFont } from "./fonts";
import { SiteHeader } from "@/components/navigation/site-header";
import { RouteTransition } from "@/components/navigation/route-transition";
import { ComparisonTray } from "@/components/compare/comparison-tray";
import { PwaShell } from "@/components/pwa/pwa-shell";
import { SubmitToolModal } from "@/components/submissions/submit-tool-modal";
import { plutosLibrary } from "@/lib/plutos-library";
import "./globals.css";
import "@/styles/typography.css";

export const metadata: Metadata = {
  applicationName: "Pluto Finds",
  title: "Pluto | Find the right AI tool for anything",
  description:
    "A premium AI-tool discovery platform for finding, comparing and understanding trustworthy AI products.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Pluto Finds" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0810",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

const introSessionBootstrap = `
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const replayLandingIntro =
    !reduceMotion &&
    location.pathname === "/" &&
    !location.hash &&
    navigationEntry?.type === "reload";

  if (replayLandingIntro) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    document.documentElement.dataset.plutoLandingReload = "true";
    window.scrollTo(0, 0);
  } else {
    let introSeen = reduceMotion;
    try {
      introSeen ||= sessionStorage.getItem("pluto_intro_seen") === "true";
    } catch {}
    if (introSeen) document.documentElement.dataset.plutoIntroSeen = "true";
  }
`;

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      className={`${bodyFont.variable} ${displayFont.variable} ${accentFont.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <Script id="pluto-intro-session" strategy="beforeInteractive">
          {introSessionBootstrap}
        </Script>
        <LoadingProvider>
          <Suspense fallback={null}>
            <ScrollReset />
          </Suspense>
          <SiteHeader />
          <RouteTransition>{children}</RouteTransition>
          <ComparisonTray />
          <PwaShell />
          <Suspense fallback={null}>
            <SubmitToolModal categories={plutosLibrary.categories.map(({ name, slug }) => ({ name, slug }))} />
          </Suspense>
          <SiteFooter />
        </LoadingProvider>
      </body>
    </html>
  );
}
