"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { GlobalLoader } from "./global-loader";

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 380;
const COMPLETE_HOLD_MS = 220;
const STUCK_TIMEOUT_MS = 10_000;

interface LoadingContextValue {
  active: boolean;
  completeLoading: () => void;
  pending: boolean;
  registerRouteFallback: () => void;
  releaseRouteFallback: () => void;
  startLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useGlobalLoading must be used within LoadingProvider");
  return context;
}

export function markIntroAsSeen() {
  try {
    sessionStorage.setItem("pluto_intro_seen", "true");
  } catch {}

  document.documentElement.dataset.plutoIntroSeen = "true";
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const pendingRef = useRef(false);
  const visibleRef = useRef(false);
  const visibleAtRef = useRef(0);
  const completionRequestedRef = useRef(false);
  const routeFallbackCountRef = useRef(0);
  const timersRef = useRef<Set<number>>(new Set());

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
  }, []);

  const finishLoading = useCallback(() => {
    if (!pendingRef.current) return;

    pendingRef.current = false;
    completionRequestedRef.current = false;
    setPending(false);
    clearTimers();

    if (!visibleRef.current) {
      setProgress(0);
      return;
    }

    const visibleFor = performance.now() - visibleAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - visibleFor);

    schedule(() => {
      setProgress(100);
      schedule(() => {
        visibleRef.current = false;
        setVisible(false);
        setProgress(0);
      }, COMPLETE_HOLD_MS);
    }, remaining);
  }, [clearTimers, schedule]);

  const completeLoading = useCallback(() => {
    if (!pendingRef.current) return;
    if (routeFallbackCountRef.current > 0) {
      completionRequestedRef.current = true;
      return;
    }
    finishLoading();
  }, [finishLoading]);

  const registerRouteFallback = useCallback(() => {
    routeFallbackCountRef.current += 1;
  }, []);

  const releaseRouteFallback = useCallback(() => {
    routeFallbackCountRef.current = Math.max(0, routeFallbackCountRef.current - 1);
    if (routeFallbackCountRef.current === 0 && completionRequestedRef.current) {
      finishLoading();
    }
  }, [finishLoading]);

  const startLoading = useCallback(() => {
    if (pendingRef.current) return;

    clearTimers();
    pendingRef.current = true;
    completionRequestedRef.current = false;
    setPending(true);
    setProgress(0);

    const show = () => {
      visibleRef.current = true;
      visibleAtRef.current = performance.now();
      setVisible(true);
      setProgress(18);
      schedule(() => setProgress(42), 360);
      schedule(() => setProgress(68), 1_100);
      schedule(() => setProgress(88), 2_500);
    };

    if (visibleRef.current) show();
    else schedule(show, SHOW_DELAY_MS);

    schedule(() => {
      if (pendingRef.current) finishLoading();
    }, STUCK_TIMEOUT_MS);
  }, [clearTimers, finishLoading, schedule]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const currentRoute = `${window.location.pathname}${window.location.search}`;
      const nextRoute = `${destination.pathname}${destination.search}`;
      if (nextRoute === currentRoute) return;

      startLoading();
      window.setTimeout(() => {
        if (event.defaultPrevented) completeLoading();
      }, 0);
    };

    const onPopState = () => startLoading();
    const onCustomStart = () => startLoading();
    const onCustomComplete = () => completeLoading();

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pluto:navigation-start", onCustomStart);
    window.addEventListener("pluto:navigation-complete", onCustomComplete);

    return () => {
      clearTimers();
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pluto:navigation-start", onCustomStart);
      window.removeEventListener("pluto:navigation-complete", onCustomComplete);
    };
  }, [clearTimers, completeLoading, startLoading]);

  const value = useMemo<LoadingContextValue>(
    () => ({
      active: pending || visible,
      completeLoading,
      pending,
      registerRouteFallback,
      releaseRouteFallback,
      startLoading
    }),
    [
      completeLoading,
      pending,
      registerRouteFallback,
      releaseRouteFallback,
      startLoading,
      visible
    ]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <RouteLoadingObserver />
      </Suspense>
      <AnimatePresence initial={false}>
        {visible ? <GlobalLoader mode="indeterminate" progress={progress} /> : null}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

function RouteLoadingObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { completeLoading } = useGlobalLoading();
  const initializedRef = useRef(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    completeLoading();
  }, [completeLoading, routeKey]);

  return null;
}
