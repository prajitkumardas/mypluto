import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { ScrollReset } from "@/components/shared/scroll-reset";
import { SiteFooter } from "@/components/shared/site-footer";
import { accentFont, bodyFont, displayFont } from "./fonts";
import { SiteHeader } from "@/components/navigation/site-header";
import { ComparisonTray } from "@/components/compare/comparison-tray";
import "./globals.css";
import "@/styles/typography.css";

export const metadata: Metadata = {
  title: "Pluto | Find the right AI tool for anything",
  description:
    "A premium AI-tool discovery platform for finding, comparing and understanding trustworthy AI products."
};

const introSessionBootstrap = `
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introSeen = reduceMotion;
  try {
    introSeen ||= sessionStorage.getItem("pluto_intro_seen") === "true";
  } catch {}
  if (introSeen) document.documentElement.dataset.plutoIntroSeen = "true";
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
        <ScrollReset />
        <SiteHeader />
        {children}
        <ComparisonTray />
        <SiteFooter />
      </body>
    </html>
  );
}
