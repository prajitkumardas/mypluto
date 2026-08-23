"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { useCompareStore } from "@/lib/compare-store";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./search-overlay";

const navItems = [
  ["Discover", "/plutos-library"],
  ["Pluto Guides", "/pluto-guides"],
  ["Trending", "/trending"],
  ["Compare", "/compare"]
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const compareCount = useCompareStore((state) => state.selected.length);

  if (pathname === "/") {
    return null;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const itemLabel = (label: string) =>
    label === "Compare" && compareCount > 0 ? `${label} ${compareCount}` : label;

  return (
    <>
      <header className="site-header-shell">
        <div className="site-header-frame">
          <Link aria-label="PlutoFinds home" className="focus-ring site-header-logo" href="/">
            <Image
              alt="PlutoFinds"
              className="site-header-logo-image"
              height={120}
              priority
              src="/images/plutofinds-logo.png"
              width={450}
            />
          </Link>

          <nav aria-label="Primary" className="site-header-nav">
            {navItems.map(([label, href]) => (
              <Link
                aria-current={isActive(href) ? "page" : undefined}
                className={cn("nav-link", isActive(href) && "nav-link-active")}
                href={href}
                key={href}
              >
                {label}
                {label === "Compare" && compareCount > 0 ? (
                  <span className="nav-count-badge">{compareCount}</span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="site-header-actions">
            <button
              aria-label="Open AI tool search"
              className="focus-ring site-header-search-button"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search aria-hidden="true" className="nav-icon" />
            </button>
            <button className="focus-ring site-header-language-button" type="button" aria-label="Language selection">
              Eng <ChevronDown aria-hidden="true" className="nav-icon" />
            </button>
            <Link className="focus-ring site-header-submit" href="/submit-tool">
              Submit a Tool
            </Link>
          </div>

          <div className="site-header-mobile-actions">
            <button
              aria-label="Open search"
              className="focus-ring nav-icon-button rounded-xl border border-white/24 bg-white/8 text-white hover:border-lime-400 hover:text-lime-400"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search aria-hidden="true" className="nav-icon" />
            </button>
            <button
              aria-label="Open menu"
              className="focus-ring nav-icon-button rounded-xl border border-white/24 bg-white/8 text-white hover:border-lime-400 hover:text-lime-400"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              {menuOpen ? (
                <X aria-hidden="true" className="nav-icon" />
              ) : (
                <Menu aria-hidden="true" className="nav-icon" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="site-header-mobile-menu lg:hidden">
            <div className="grid gap-2">
              {[...navItems, ["Submit a Tool", "/submit-tool"] as const].map(([item, href]) => (
                <Link
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn(
                    "focus-ring flex min-h-12 items-center justify-between rounded-xl px-3 type-label-md text-white/86 hover:bg-white/8",
                    isActive(href) && "bg-white/10 text-white"
                  )}
                  href={href}
                  key={item}
                  onClick={() => setMenuOpen(false)}
                >
                  {itemLabel(item)}
                  <ArrowRight aria-hidden="true" className="nav-icon" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <SearchOverlay onOpenChange={setSearchOpen} open={searchOpen} />
    </>
  );
}
