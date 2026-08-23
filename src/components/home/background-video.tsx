"use client";

import type { MotionValue } from "motion/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./pluto-story-section.module.css";

type BackgroundVideoProps = {
  scale: MotionValue<number> | number;
  reducedMotion: boolean;
};

const VIDEO_SRC = "/videos/hero-background.mp4";
const POSTER_SRC = "/images/home/hero/pluto-valley-background.webp";

export function BackgroundVideo({ scale, reducedMotion }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;

    const tryPlay = () => {
      if (reducedMotion) {
        video.pause();
        return;
      }
      void video.play().catch(() => {
        // Autoplay can be blocked; the poster keeps the section readable.
      });
    };

    if (!("IntersectionObserver" in window)) {
      tryPlay();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { rootMargin: "360px 0px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [failed, reducedMotion]);

  return (
    <div className={styles.videoShell} aria-hidden="true">
      <div className={styles.posterFallback} />
      <motion.video
        autoPlay={!reducedMotion}
        className={`${styles.video} ${ready && !failed ? styles.videoReady : ""} ${failed ? styles.videoFailed : ""}`}
        disablePictureInPicture
        loop
        muted
        onCanPlay={() => setReady(true)}
        onError={() => setFailed(true)}
        onLoadedData={() => setReady(true)}
        playsInline
        poster={POSTER_SRC}
        preload="metadata"
        ref={videoRef}
        style={{ scale }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </motion.video>
    </div>
  );
}
