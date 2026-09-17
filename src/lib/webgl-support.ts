"use client";

import { useEffect, useState } from "react";

export type WebGLSupport =
  | { available: true; reason: "available" }
  | {
      available: false;
      reason: "checking" | "reduced-motion" | "save-data" | "low-memory" | "unavailable";
    };

type NavigatorWithDeviceHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function detectWebGLSupport(): WebGLSupport {
  if (typeof window === "undefined") return { available: false, reason: "checking" };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return { available: false, reason: "reduced-motion" };
  }

  const deviceNavigator = window.navigator as NavigatorWithDeviceHints;
  if (deviceNavigator.connection?.saveData) return { available: false, reason: "save-data" };
  if (deviceNavigator.deviceMemory !== undefined && deviceNavigator.deviceMemory <= 2) {
    return { available: false, reason: "low-memory" };
  }

  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });

    if (!context) return { available: false, reason: "unavailable" };

    const loseContext = context.getExtension("WEBGL_lose_context");
    loseContext?.loseContext();
    return { available: true, reason: "available" };
  } catch {
    return { available: false, reason: "unavailable" };
  }
}

export function useWebGLSupport() {
  const [support, setSupport] = useState<WebGLSupport>({ available: false, reason: "checking" });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSupport(detectWebGLSupport());

    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  return support;
}
