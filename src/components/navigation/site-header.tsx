"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { getActivePrimaryRoute, primaryRoutes } from "@/components/navigation/primary-routes";
import { SubmitToolButton, SubmitToolLink } from "@/components/submissions/submit-tool-trigger";
import { useCompareStore } from "@/lib/compare-store";

const HOME_SEARCH_HASH = "#home-search";
const HOME_SEARCH_EVENT = "pluto:focus-home-search";
const HOME_SEARCH_HREF = `/${HOME_SEARCH_HASH}`;
const ENTER_FLOATING_AT = 72;
const EXIT_FLOATING_AT = 28;
const DESKTOP_NAV_QUERY = "(min-width: 1024px)";
const NAV_EASING = [0.22, 1, 0.36, 1] as const;

type NavbarState = "expanded" | "floating";

const secondaryItems = [
  ["About Pluto", "/pluto"],
  ["Submit a Tool", "/submit-tool"],
  ["Verification", "/verification"],
  ["Privacy", "/privacy"]
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navbarState, setNavbarState] = useState<NavbarState>("expanded");
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const compareCount = useCompareStore((state) => state.selected.length);
  const activePrimaryRoute = getActivePrimaryRoute(pathname);
  const internalProductRoute = Boolean(activePrimaryRoute);
  const landingRoute = pathname === "/";

  useEffect(() => {
    let frameId: number | null = null;
    const desktopQuery = window.matchMedia(DESKTOP_NAV_QUERY);

    const updateNavbarState = () => {
      frameId = null;
      const scrollY = window.scrollY;

      setScrolled((current) => {
        const next = scrollY > 8;
        return current === next ? current : next;
      });

      setNavbarState((current) => {
        if (!desktopQuery.matches) return current === "expanded" ? current : "expanded";
        if (current === "expanded" && scrollY > ENTER_FLOATING_AT) return "floating";
        if (current === "floating" && scrollY < EXIT_FLOATING_AT) return "expanded";
        return current;
      });
    };

    const scheduleUpdate = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateNavbarState);
    };

    updateNavbarState();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    desktopQuery.addEventListener("change", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      desktopQuery.removeEventListener("change", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

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
    <header
      className="site-header-shell"
      data-navbar-state={navbarState}
      data-scrolled={scrolled ? "true" : "false"}
    >
      <motion.div
        className="site-header-frame"
        data-state={navbarState}
        initial={false}
        layout={!reduceMotion}
        transition={{ layout: { duration: reduceMotion ? 0.01 : 0.48, ease: NAV_EASING } }}
      >
        <motion.div
          className="site-header-logo-region"
          layout={!reduceMotion ? "position" : false}
          transition={{ layout: { duration: 0.48, ease: NAV_EASING } }}
        >
          <Link aria-label="PlutoFinds home" className="focus-ring site-header-logo" data-scroll-top="true" href="/">
            <Image
              alt="PlutoFinds"
              className="site-header-logo-image"
              height={120}
              priority
              src="/images/plutofinds-logo.png"
              width={450}
            />
          </Link>
        </motion.div>

        <motion.nav
          aria-label="Primary"
          className="site-header-nav"
          layout={!reduceMotion ? "position" : false}
          transition={{ layout: { duration: 0.48, ease: NAV_EASING } }}
        >
          {primaryRoutes.map(({ href, longLabel: label }) => (
            <Link
              aria-current={activePrimaryRoute?.href === href ? "page" : undefined}
              className="nav-link"
              data-primary-nav="true"
              href={href}
              key={href}
            >
              {label}
              {label === "Compare" && compareCount > 0 ? (
                <span className="nav-count-badge">{compareCount}</span>
              ) : null}
            </Link>
          ))}
        </motion.nav>

        <motion.div
          className="site-header-actions"
          layout={!reduceMotion ? "position" : false}
          transition={{ layout: { duration: 0.48, ease: NAV_EASING } }}
        >
          <Link
            aria-label="Go to landing page search"
            className="focus-ring site-header-search-button"
            href={HOME_SEARCH_HREF}
            onClick={handleHomeSearchClick}
          >
            <Search aria-hidden="true" className="nav-icon" />
          </Link>
          <SubmitToolButton className="site-header-submit-button" size="sm" variant="primary">
            Submit a Tool
          </SubmitToolButton>
        </motion.div>

        <div className="site-header-mobile-actions">
          <Link
            aria-label="Go to landing page search"
            className="focus-ring nav-icon-button rounded-xl border border-white/24 bg-white/8 text-white hover:border-lime-400 hover:text-lime-400"
            href={HOME_SEARCH_HREF}
            onClick={handleHomeSearchClick}
          >
            <Search aria-hidden="true" className="nav-icon" />
          </Link>
          <Dialog.Root onOpenChange={setMenuOpen} open={menuOpen}>
            <Dialog.Trigger asChild>
              <button
                aria-label="Open menu"
                className="focus-ring nav-icon-button rounded-xl border border-white/24 bg-white/8 text-white hover:border-lime-400 hover:text-lime-400"
                type="button"
              >
                <Menu aria-hidden="true" className="nav-icon" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="site-header-mobile-overlay" />
              <Dialog.Content
                className="site-header-mobile-menu"
                data-landing-route={landingRoute ? "true" : "false"}
                data-product-route={internalProductRoute ? "true" : "false"}
              >
                {landingRoute ? (
                  <div aria-hidden="true" className="site-header-mobile-menu-layers">
                    <span />
                    <span />
                  </div>
                ) : null}
                <div className="site-header-mobile-menu-surface">
                  <div className="site-header-mobile-menu-heading">
                    <div>
                      {landingRoute ? <span className="site-header-mobile-menu-eyebrow">Explore Pluto</span> : null}
                      <Dialog.Title>Pluto menu</Dialog.Title>
                    </div>
                    <Dialog.Description className="sr-only">
                      {internalProductRoute ? "Secondary Pluto links" : "Pluto navigation"}
                    </Dialog.Description>
                    <Dialog.Close asChild>
                      <button
                        aria-label="Close menu"
                        className="focus-ring nav-icon-button site-header-mobile-menu-close"
                        type="button"
                      >
                        <X aria-hidden="true" className="nav-icon" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <nav aria-label="Mobile primary" className="site-header-mobile-primary grid gap-2">
                    {primaryRoutes.map(({ href, longLabel }) => (
                      <MenuLink href={href} key={href} label={itemLabel(longLabel)} />
                    ))}
                  </nav>
                  {internalProductRoute ? (
                    <nav aria-label="Secondary" className="site-header-mobile-secondary grid gap-2">
                      {secondaryItems.map(([label, href]) => <MenuLink href={href} key={href} label={label} />)}
                    </nav>
                  ) : (
                    <nav aria-label="More" className="site-header-mobile-secondary grid gap-2">
                      <MenuLink href="/submit-tool" label="Submit a Tool" />
                    </nav>
                  )}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </motion.div>
    </header>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  if (href === "/submit-tool") {
    return (
      <Dialog.Close asChild>
        <SubmitToolLink className="site-header-mobile-link focus-ring flex min-h-11 items-center justify-between rounded-xl px-3 type-label-md text-white/86 hover:bg-white/8">
          {label}
          <ArrowRight aria-hidden="true" className="nav-icon" />
        </SubmitToolLink>
      </Dialog.Close>
    );
  }
  return (
    <Dialog.Close asChild>
      <Link
        className="site-header-mobile-link focus-ring flex min-h-11 items-center justify-between rounded-xl px-3 type-label-md text-white/86 hover:bg-white/8"
        href={href}
      >
        {label}
        <ArrowRight aria-hidden="true" className="nav-icon" />
      </Link>
    </Dialog.Close>
  );
}

