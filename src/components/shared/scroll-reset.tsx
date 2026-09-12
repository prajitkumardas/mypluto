"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const STORAGE_KEY = "pluto-scroll-positions-v1";
const MAX_POSITIONS = 50;
type NavigationIntent = "initial" | "new" | "history";
type ScrollPositions = Record<string, number>;

function routeKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function readPositions(): ScrollPositions {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}") as ScrollPositions;
  } catch {
    return {};
  }
}

function savePosition(key: string, position: number) {
  try {
    const positions = readPositions();
    delete positions[key];
    positions[key] = Math.max(0, Math.round(position));
    const entries = Object.entries(positions).slice(-MAX_POSITIONS);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Session storage can be unavailable in private browsing modes.
  }
}

function restorePosition(key: string) {
  const position = readPositions()[key] ?? 0;
  window.scrollTo({ left: 0, top: position, behavior: "auto" });
}

function resetPosition() {
  window.scrollTo({ left: 0, top: 0, behavior: "auto" });
}

export function ScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const intentRef = useRef<NavigationIntent>("initial");
  const currentKeyRef = useRef("");
  const previousPathnameRef = useRef<string | null>(null);
  const clickLockRef = useRef<{ href: string; at: number } | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);
  const query = searchParams.toString();
  const currentRouteKey = `${pathname}${query ? `?${query}` : ""}`;

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const previousPathname = previousPathnameRef.current;
    const isFirstRender = previousPathname === null;
    const pathnameChanged = previousPathname !== pathname;

    if (!window.location.hash) {
      if (intentRef.current === "history") restorePosition(currentRouteKey);
      else if (isFirstRender || pathnameChanged) resetPosition();
    }

    document.documentElement.removeAttribute("data-route-navigating");
    document.body.classList.remove("route-leaving");
    if (navigationTimeoutRef.current !== null) {
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    currentKeyRef.current = currentRouteKey;
    previousPathnameRef.current = pathname;
    intentRef.current = "new";
  }, [currentRouteKey, pathname]);

  useEffect(() => {
    let scrollFrame: number | null = null;

    const persistCurrentPosition = () => {
      if (!currentKeyRef.current) return;
      savePosition(currentKeyRef.current, window.scrollY);
    };

    const onScroll = () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        persistCurrentPosition();
      });
    };

    const onPopState = () => {
      intentRef.current = "history";
      if (window.location.pathname === previousPathnameRef.current) restorePosition(routeKey());
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;

      const destinationKey = `${destination.pathname}${destination.search}`;
      const activeKey = routeKey();
      if (anchor.dataset.primaryNav === "true" && destinationKey === activeKey) {
        event.preventDefault();
        window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
        return;
      }
      if (destinationKey === activeKey) {
        if (anchor.dataset.scrollTop === "true") {
          event.preventDefault();
          resetPosition();
        }
        return;
      }

      const now = performance.now();
      if (clickLockRef.current?.href === destination.href && now - clickLockRef.current.at < 500) {
        event.preventDefault();
        return;
      }
      clickLockRef.current = { href: destination.href, at: now };
      window.setTimeout(() => {
        if (clickLockRef.current?.href === destination.href) clickLockRef.current = null;
      }, 550);

      persistCurrentPosition();
      intentRef.current = "new";
      document.documentElement.dataset.routeNavigating = "true";
      document.body.classList.add("route-leaving");
      if (navigationTimeoutRef.current !== null) window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = window.setTimeout(() => {
        document.documentElement.removeAttribute("data-route-navigating");
        document.body.classList.remove("route-leaving");
        navigationTimeoutRef.current = null;
      }, 8000);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", persistCurrentPosition);
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
      if (navigationTimeoutRef.current !== null) window.clearTimeout(navigationTimeoutRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", persistCurrentPosition);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, []);

  return null;
}
