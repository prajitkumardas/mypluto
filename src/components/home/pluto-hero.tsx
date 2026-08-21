"use client";

import type { FocusEvent } from "react";
import { useRef, useState } from "react";
import { CirclePlay, Code2, Image as ImageIcon, PenLine } from "lucide-react";
import { CategoryShortcut } from "./category-shortcut";
import { HeroNavigation } from "./hero-navigation";
import { HeroSearch } from "./hero-search";
import { InteractivePluto } from "./interactive-pluto";
import { cn } from "@/lib/utils";
import styles from "./pluto-hero.module.css";

const HERO_BACKGROUND_VIDEO_SRC = "/videos/hero-background.mp4";
const HERO_BACKGROUND_POSTER_SRC = "/images/home/hero/pluto-valley-background.webp";

const shortcuts = [
  {
    label: "Image",
    href: "/plutos-library/ai-image-generation-and-design",
    icon: ImageIcon
  },
  {
    label: "Writing",
    href: "/plutos-library/ai-writing-and-content",
    icon: PenLine
  },
  {
    label: "Video",
    href: "/plutos-library/ai-video",
    icon: CirclePlay
  },
  {
    label: "Code",
    href: "/plutos-library/ai-coding-and-development",
    icon: Code2
  }
];

export function PlutoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [introComplete, setIntroComplete] = useState(false);

  const playBackgroundVideo = () => {
    if (!introComplete) return;

    const video = videoRef.current;
    if (!video) return;

    video.loop = true;
    void video.play().catch(() => {
      // Autoplay can be blocked in unusual browser states; the next pointer leave can retry.
    });
  };

  const pauseBackgroundVideo = () => {
    if (!introComplete) return;

    videoRef.current?.pause();
  };

  const revealHeroContent = () => {
    setIntroComplete(true);

    const video = videoRef.current;
    if (!video) return;

    video.loop = true;
    video.currentTime = 0;
    window.setTimeout(() => {
      void video.play().catch(() => {
        // Keep the revealed hero usable even if replay is blocked.
      });
    }, 0);
  };

  const resumeBackgroundVideoOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;

    playBackgroundVideo();
  };

  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <video
        aria-hidden="true"
        autoPlay
        className={styles.backgroundVideo}
        muted
        ref={videoRef}
        onEnded={revealHeroContent}
        onError={revealHeroContent}
        playsInline
        poster={HERO_BACKGROUND_POSTER_SRC}
        preload="auto"
      >
        <source src={HERO_BACKGROUND_VIDEO_SRC} type="video/mp4" />
      </video>
      <div className={styles.skyWash} aria-hidden="true" />
      <div className={styles.cloudsFar} aria-hidden="true" />
      <div className={styles.cloudsNear} aria-hidden="true" />
      <div className={styles.rainbowShimmer} aria-hidden="true" />
      <div className={styles.windLayerBack} aria-hidden="true" />
      <div className={styles.windLayerFront} aria-hidden="true" />

      <div className={styles.heroInner}>
        <HeroNavigation />

        <div
          aria-hidden={!introComplete}
          className={cn(
            styles.heroExperience,
            introComplete ? styles.heroExperienceVisible : styles.heroExperienceHidden
          )}
        >
          <div className={styles.heroCopy}>
            <div className={styles.trustLine}>
              <span className={styles.avatarStack} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span>700+ AI tools - Updated weekly</span>
            </div>

            <h1 className={styles.headline} id="home-hero-title">
              Find your perfect <span>AI tool.</span>
            </h1>
            <div
              className={styles.heroControls}
              onBlur={resumeBackgroundVideoOnBlur}
              onFocus={pauseBackgroundVideo}
              onPointerEnter={pauseBackgroundVideo}
              onPointerLeave={playBackgroundVideo}
            >
              <HeroSearch />
              <div className={styles.shortcutChips} aria-label="Popular AI tool categories">
                {shortcuts.map((shortcut) => (
                  <CategoryShortcut
                    href={shortcut.href}
                    icon={shortcut.icon}
                    key={shortcut.label}
                    label={shortcut.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.plutoStage}>
            <InteractivePluto />
          </div>
        </div>
      </div>
    </section>
  );
}
