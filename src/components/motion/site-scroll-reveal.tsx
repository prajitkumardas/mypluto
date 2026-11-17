"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = [
  '[data-scroll-reveal]:not([data-scroll-reveal="off"])',
  'main section:not([data-scroll-reveal="off"])',
  'main article:not([data-scroll-reveal="off"])',
  '[data-scroll-reveal-group] > *'
].join(",");

function isEligible(element: HTMLElement) {
  if (element.closest('[data-scroll-reveal="off"], [role="dialog"], [aria-hidden="true"]')) return false;
  if (element.offsetParent === null || element.getBoundingClientRect().height === 0) return false;

  return true;
}

function hasManagedAncestor(element: HTMLElement, managedRegions: Set<HTMLElement>) {
  if (element.parentElement?.hasAttribute("data-scroll-reveal-group")) return false;

  let ancestor = element.parentElement;
  while (ancestor) {
    if (managedRegions.has(ancestor)) return true;
    ancestor = ancestor.parentElement;
  }

  return false;
}

export function SiteScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const managedRegions = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          animations.get(element)?.play();
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    const register = (root: ParentNode = document) => {
      const elements = root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

      elements.forEach((element) => {
        if (managedRegions.has(element) || !isEligible(element) || hasManagedAncestor(element, managedRegions)) return;

        managedRegions.add(element);

        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88 || typeof element.animate !== "function") return;

        let delay = 0;
        if (element.parentElement?.hasAttribute("data-scroll-reveal-group")) {
          const siblings = Array.from(element.parentElement.children);
          const itemIndex = Math.max(0, siblings.indexOf(element));
          delay = Math.min(itemIndex, 5) * 55;
        }

        const animation = element.animate(
          [
            { opacity: 0, filter: "blur(5px)", transform: "translate3d(0, 24px, 0) scale(0.988)" },
            { opacity: 1, filter: "blur(0)", transform: "translate3d(0, 0, 0) scale(1)" }
          ],
          { delay, duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
        );

        animation.pause();
        animation.currentTime = 0;
        animations.set(element, animation);
        observer.observe(element);
      });
    };

    const frame = window.requestAnimationFrame(() => register());
    const mutations = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        entry.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) register(node.parentElement ?? node);
        });
      });
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}
