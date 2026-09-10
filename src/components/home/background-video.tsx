"use client";

import type { MotionValue } from "motion/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./pluto-story-section.module.css";

type BackgroundVideoProps = {
  scale: MotionValue<number> | number;
};

const VIDEO_SRC = "/videos/hero-background.mp4";
const POSTER_SRC = "/images/home/hero/pluto-valley-background.webp";

function requestPlayback(video: HTMLVideoElement) {
  video.defaultMuted = true;
  video.muted = true;
  return video.play();
}

export function BackgroundVideo({ scale }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    let disposed = false;
    let retryTimer: number | undefined;

    const scheduleRetry = () => {
      if (disposed || retryTimer || document.hidden) return;
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        tryPlay();
      }, 500);
    };

    const tryPlay = () => {
      if (disposed || document.hidden) return;
      void requestPlayback(video).catch(scheduleRetry);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) tryPlay();
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("pause", scheduleRetry);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", tryPlay);

    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("pause", scheduleRetry);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", tryPlay);
    };
  }, [failed]);

  const handleReady = (video: HTMLVideoElement) => {
    setReady(true);
    void requestPlayback(video).catch(() => {
      // The mounted effect retries once the browser can begin playback.
    });
  };

  return (
    <div className={styles.videoShell} aria-hidden="true">
      <div className={styles.posterFallback} />
      <motion.video
        autoPlay
        className={`${styles.video} ${ready && !failed ? styles.videoReady : ""} ${failed ? styles.videoFailed : ""}`}
        disablePictureInPicture
        loop
        muted
        onCanPlay={(event) => handleReady(event.currentTarget)}
        onError={() => setFailed(true)}
        onLoadedData={(event) => handleReady(event.currentTarget)}
        playsInline
        poster={POSTER_SRC}
        preload="auto"
        ref={videoRef}
        style={{ scale }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </motion.video>
    </div>
  );
}
