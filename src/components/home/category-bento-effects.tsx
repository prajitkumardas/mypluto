"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const CARD_SELECTOR = "[data-magic-category-card]";
const GRID_SELECTOR = "[data-magic-category-grid]";
const SECTION_SELECTOR = "[data-magic-category-section]";
const MOBILE_BREAKPOINT = 768;

type CategoryBentoEffectsProps = {
  glowColor?: string;
  spotlightRadius?: number;
  particleCount?: number;
  disableAnimations?: boolean;
};

const createParticle = (x: number, y: number, glowColor: string) => {
  const particle = document.createElement("span");
  particle.setAttribute("aria-hidden", "true");
  particle.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(${glowColor}, 0.96);
    box-shadow: 0 0 8px rgba(${glowColor}, 0.72);
    pointer-events: none;
    z-index: 6;
  `;
  return particle;
};

const updateGlow = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

export function CategoryBentoEffects({
  glowColor = "124, 99, 255",
  spotlightRadius = 400,
  particleCount = 12,
  disableAnimations = false
}: CategoryBentoEffectsProps) {
  useEffect(() => {
    const grid = document.querySelector<HTMLElement>(GRID_SELECTOR);
    const section = document.querySelector<HTMLElement>(SECTION_SELECTOR);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (!grid || !section || disableAnimations) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(CARD_SELECTOR));
    const revealTween =
      reduceMotion
        ? null
        : gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 34, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.72,
              ease: "power3.out",
              stagger: 0.08,
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: grid,
                start: "top 82%",
                once: true
              }
            }
          );

    if (reduceMotion || isMobile) {
      return () => {
        revealTween?.scrollTrigger?.kill();
        revealTween?.kill();
      };
    }
    const timeouts: number[] = [];
    const activeParticles = new Map<HTMLElement, HTMLElement[]>();
    const activeTweens = new Map<HTMLElement, gsap.core.Tween[]>();

    const spotlight = document.createElement("div");
    spotlight.setAttribute("aria-hidden", "true");
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 999px;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 26%,
        rgba(${glowColor}, 0.02) 42%,
        transparent 70%
      );
      z-index: 30;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);

    const clearParticles = (card: HTMLElement) => {
      activeTweens.get(card)?.forEach((tween) => tween.kill());
      activeTweens.delete(card);

      activeParticles.get(card)?.forEach((particle) => {
        gsap.to(particle, {
          opacity: 0,
          scale: 0,
          duration: 0.25,
          ease: "back.in(1.7)",
          onComplete: () => particle.remove()
        });
      });
      activeParticles.delete(card);
    };

    const spawnParticles = (card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const particles: HTMLElement[] = [];
      const tweens: gsap.core.Tween[] = [];

      for (let index = 0; index < particleCount; index += 1) {
        const timeout = window.setTimeout(() => {
          if (!card.matches(":hover")) return;

          const particle = createParticle(Math.random() * rect.width, Math.random() * rect.height, glowColor);
          card.appendChild(particle);
          particles.push(particle);

          tweens.push(gsap.fromTo(particle, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(1.7)" }));
          tweens.push(
            gsap.to(particle, {
              x: (Math.random() - 0.5) * 96,
              y: (Math.random() - 0.5) * 96,
              opacity: 0.32,
              rotation: Math.random() * 360,
              duration: 1.8 + Math.random() * 1.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true
            })
          );
        }, index * 80);
        timeouts.push(timeout);
      }

      activeParticles.set(card, particles);
      activeTweens.set(card, tweens);
    };

    const onDocumentMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.35, ease: "power2.out" });
        cards.forEach((card) => card.style.setProperty("--glow-intensity", "0"));
        return;
      }

      const proximity = spotlightRadius * 0.5;
      const fadeDistance = spotlightRadius * 0.75;
      let minDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        const glow = effectiveDistance <= proximity ? 1 : effectiveDistance <= fadeDistance ? (fadeDistance - effectiveDistance) / (fadeDistance - proximity) : 0;

        minDistance = Math.min(minDistance, effectiveDistance);
        updateGlow(card, event.clientX, event.clientY, glow, spotlightRadius);
      });

      gsap.to(spotlight, { left: event.clientX, top: event.clientY, duration: 0.12, ease: "power2.out" });
      gsap.to(spotlight, {
        opacity: minDistance <= proximity ? 0.75 : minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.75 : 0,
        duration: 0.22,
        ease: "power2.out"
      });
    };

    const disposers = cards.map((card) => {
      const onEnter = () => spawnParticles(card);
      const onLeave = () => {
        clearParticles(card);
        card.style.setProperty("--glow-intensity", "0");
      };
      const onClick = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height)
        );
        const ripple = document.createElement("span");
        ripple.setAttribute("aria-hidden", "true");
        ripple.style.cssText = `
          position: absolute;
          left: ${x - maxDistance}px;
          top: ${y - maxDistance}px;
          width: ${maxDistance * 2}px;
          height: ${maxDistance * 2}px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(${glowColor}, 0.34) 0%, rgba(${glowColor}, 0.16) 32%, transparent 70%);
          pointer-events: none;
          z-index: 5;
        `;
        card.appendChild(ripple);
        gsap.fromTo(ripple, { opacity: 1, scale: 0 }, { opacity: 0, scale: 1, duration: 0.72, ease: "power2.out", onComplete: () => ripple.remove() });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("click", onClick);

      return () => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("click", onClick);
      };
    });

    document.addEventListener("mousemove", onDocumentMove);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      revealTween?.scrollTrigger?.kill();
      revealTween?.kill();
      disposers.forEach((dispose) => dispose());
      cards.forEach(clearParticles);
      document.removeEventListener("mousemove", onDocumentMove);
      spotlight.remove();
    };
  }, [disableAnimations, glowColor, particleCount, spotlightRadius]);

  return null;
}