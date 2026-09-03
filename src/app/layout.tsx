import type { Metadata } from "next";
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

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={`${bodyFont.variable} ${displayFont.variable} ${accentFont.variable}`} lang="en">
      <body>
        <ScrollReset />
        <SiteHeader />
        {children}
        <ComparisonTray />
        <SiteFooter />
      </body>
    </html>
  );
}
