"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { useCompareStore } from "@/lib/compare-store";

const HOME_SEARCH_HASH = "#home-search";
const HOME_SEARCH_EVENT = "pluto:focus-home-search";
const HOME_SEARCH_HREF = `/${HOME_SEARCH_HASH}`;

const navItems = [
  ["Discover", "/plutos-library"],
  ["Pluto Guides", "/pluto-guides"],
  ["Trending", "/trending"],
  ["Compare", "/compare"],
  ["Play", "/pluto"]
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const compareCount = useCompareStore((state) => state.selected.length);

  const handleHomeSearchClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);

    if (pathname !== "/") return;

    event.preventDefault();
    window.history.pushState(null, "", HOME_SEARCH_HREF);
    window.dispatchEvent(new Event(HOME_SEARCH_EVENT));
  };

  const itemLabel = (label: string) =>
    label === "Compare" && compareCount > 0 ? `${label} ${compareCount}` : label;

  return (
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
              className="nav-link"
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
          <Link
            aria-label="Go to landing page search"
            className="focus-ring site-header-search-button"
            href={HOME_SEARCH_HREF}
            onClick={handleHomeSearchClick}
          >
            <Search aria-hidden="true" className="nav-icon" />
          </Link>
          <Link className="focus-ring site-header-submit" href="/submit-tool">
            Submit a Tool
          </Link>
        </div>

        <div className="site-header-mobile-actions">
          <Link
            aria-label="Go to landing page search"
            className="focus-ring nav-icon-button rounded-xl border border-white/24 bg-white/8 text-white hover:border-lime-400 hover:text-lime-400"
            href={HOME_SEARCH_HREF}
            onClick={handleHomeSearchClick}
          >
            <Search aria-hidden="true" className="nav-icon" />
          </Link>
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
                className="focus-ring flex min-h-10 items-center justify-between rounded-xl px-3 type-label-md text-white/86 hover:bg-white/8"
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
  );
}
