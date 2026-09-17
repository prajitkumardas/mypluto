"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, RefreshCw, Share, WifiOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getActivePrimaryRoute, primaryRoutes, type PrimaryRoute } from "@/components/navigation/primary-routes";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const VISIT_KEY = "pluto-pwa-visits-v1";
const DISMISS_KEY = "pluto-pwa-install-dismissed-v1";
const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true);
}

export function PwaShell() {
  const pathname = usePathname();
  const activePrimaryRoute = getActivePrimaryRoute(pathname);
  const [online, setOnline] = useState(true);
  const [connectionNotice, setConnectionNotice] = useState<"offline" | "online" | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const initializedNetworkRef = useRef(false);
  const reloadForUpdateRef = useRef(false);

  const dismissInstall = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowInstall(false);
    setShowIosHelp(false);
  }, []);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(() => setOnline(navigator.onLine));
    const updateConnection = () => {
      const nextOnline = navigator.onLine;
      setOnline(nextOnline);
      if (initializedNetworkRef.current) setConnectionNotice(nextOnline ? "online" : "offline");
      initializedNetworkRef.current = true;
    };
    initializedNetworkRef.current = true;
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  useEffect(() => {
    if (!connectionNotice) return;
    const timeout = window.setTimeout(() => setConnectionNotice(null), connectionNotice === "online" ? 3000 : 6000);
    return () => window.clearTimeout(timeout);
  }, [connectionNotice]);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || "0");
    const visits = Number(localStorage.getItem(VISIT_KEY) || "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      if (visits >= 2 && Date.now() - dismissedAt > DISMISS_FOR_MS && !isStandalone()) setShowInstall(true);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setShowInstall(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    let timer: number | undefined;
    if (isiOS && visits >= 2 && !isStandalone() && Date.now() - dismissedAt > DISMISS_FOR_MS) {
      timer = window.setTimeout(() => setShowIosHelp(true), 3500);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => void registration.unregister()));
      return;
    }

    let cancelled = false;
    const register = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      if (cancelled) return;
      if (registration.waiting) setUpdateRegistration(registration);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) setUpdateRegistration(registration);
        });
      });
    };
    const start = () => void register().catch(() => undefined);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    const onControllerChange = () => {
      if (reloadForUpdateRef.current) return;
      reloadForUpdateRef.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "dismissed") dismissInstall();
    else setShowInstall(false);
  };

  return (
    <>
      {connectionNotice ? (
        <div aria-live="polite" className={`pwa-network-banner ${connectionNotice === "online" ? "is-online" : ""}`} role="status">
          {connectionNotice === "offline" ? <><WifiOff aria-hidden="true" /> You&apos;re offline. Previously visited public pages may still work.</> : <>Back online. Fresh content is available.</>}
        </div>
      ) : null}

      {updateRegistration ? (
        <aside aria-label="App update available" className="pwa-prompt">
          <div><strong>Pluto has an update</strong><span>Refresh when you&apos;re ready.</span></div>
          <button className="pwa-shell-button pwa-shell-button-primary" onClick={() => updateRegistration.waiting?.postMessage({ type: "SKIP_WAITING" })} type="button"><RefreshCw aria-hidden="true" /> Update</button>
          <button aria-label="Dismiss update" className="pwa-icon-button" onClick={() => setUpdateRegistration(null)} type="button"><X aria-hidden="true" /></button>
        </aside>
      ) : null}

      {showInstall || showIosHelp ? (
        <aside aria-label="Install Pluto Finds" className="pwa-prompt">
          <div><strong>Keep Pluto close</strong><span>{showIosHelp ? "In Safari, tap Share, then Add to Home Screen." : "Install for quicker access. Previously visited public pages may remain available offline."}</span></div>
          {showIosHelp ? <Share aria-hidden="true" className="pwa-prompt-symbol" /> : <button className="pwa-shell-button pwa-shell-button-primary" onClick={() => void install()} type="button"><Download aria-hidden="true" /> Install</button>}
          <button aria-label="Dismiss install suggestion" className="pwa-icon-button" onClick={dismissInstall} type="button"><X aria-hidden="true" /></button>
        </aside>
      ) : null}

      {activePrimaryRoute ? (
        <nav aria-label="Primary" className="pwa-bottom-nav">
          {primaryRoutes.map((route) => (
            <PwaNavItem active={route.href === activePrimaryRoute.href} key={route.href} route={route} />
          ))}
        </nav>
      ) : null}
      <span aria-live="polite" className="sr-only">{online ? "Online" : "Offline"}</span>
    </>
  );
}

function PwaNavItem({ active, route }: { active: boolean; route: PrimaryRoute }) {
  const Icon = route.icon;
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={active ? "is-active" : undefined}
      data-primary-nav="true"
      href={route.href}
    >
      <Icon aria-hidden="true" />
      <span>{route.label}</span>
    </Link>
  );
}
