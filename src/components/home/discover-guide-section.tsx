"use client";

import Link from "next/link";
import { type MutableRefObject, type RefObject, useEffect, useRef, useState } from "react";
import { motion, type MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./discover-guide-section.module.css";

const VIDEO_SRC = "/videos/home/steps-section-video.mp4";
const POSTER_SRC = "/images/home/discover-guide/frame-21.jpg";
const SMOOTHING_FACTOR = 0.1;

const guideSteps = [
  {
    title: "What would you mainly like to accomplish?",
    copy: "Choose one primary goal. This helps Pluto narrow the right category first."
  },
  {
    title: "Which task should the tool help with?",
    copy: "Choose the closest task. Pluto will use this to sharpen the ranking."
  },
  {
    title: "What should Pluto prioritize?",
    copy: "Choose up to three priorities. No strong preference clears the others."
  },
  {
    title: "What requirements matter?",
    copy: "Set the budget, platform, and any must-have constraints before Pluto ranks the matches."
  }
];

const stepThresholds = [0.24, 0.39, 0.54, 0.69];

export function DiscoverGuideSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const reducedMotion = Boolean(useReducedMotion());
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.85 });

  useScrollScrubbedVideo({ progress: scrollYProgress, reducedMotion, sectionRef, videoRef, durationRef, setVideoReady });

  const eyebrowOpacity = useTransform(progress, [0.08, 0.18], [0, 1]);
  const eyebrowY = useTransform(progress, [0.08, 0.18], [10, 0]);
  const eyebrowBlur = useTransform(progress, [0.08, 0.18], ["blur(4px)", "blur(0px)"]);
  const titleOpacity = useTransform(progress, [0.12, 0.23], [0, 1]);
  const titleY = useTransform(progress, [0.12, 0.23], [20, 0]);
  const titleBlur = useTransform(progress, [0.12, 0.23], ["blur(5px)", "blur(0px)"]);
  const copyOpacity = useTransform(progress, [0.18, 0.28], [0, 1]);
  const copyY = useTransform(progress, [0.18, 0.28], [14, 0]);
  const copyBlur = useTransform(progress, [0.18, 0.28], ["blur(4px)", "blur(0px)"]);
  const lineScale = useTransform(progress, [0.24, 0.84], [0, 1]);
  const ctaOpacity = useTransform(progress, [0.78, 0.88], [0, 1]);
  const ctaY = useTransform(progress, [0.78, 0.88], [12, 0]);

  return (
    <section
      aria-labelledby="discover-guide-title"
      className={`${styles.section} ${reducedMotion ? styles.reducedMotion : ""}`}
      id="library"
      ref={sectionRef}
    >
      <div className={styles.stickyScene}>
        <video
          aria-hidden="true"
          className={`${styles.video} ${videoReady ? styles.videoReady : ""}`}
          disablePictureInPicture
          muted
          playsInline
          poster={POSTER_SRC}
          preload="metadata"
          ref={videoRef}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className={styles.posterFallback} aria-hidden="true" />
        <div className={styles.overlay} aria-hidden="true" />

        <div className={styles.content}>
          <div className={styles.heroCopy}>
            <motion.p
              className={styles.eyebrow}
              style={reducedMotion ? undefined : { filter: eyebrowBlur, opacity: eyebrowOpacity, y: eyebrowY }}
            >
              Discover
            </motion.p>
            <motion.h2
              className={styles.title}
              id="discover-guide-title"
              style={reducedMotion ? undefined : { filter: titleBlur, opacity: titleOpacity, y: titleY }}
            >
              Not sure where to start?
            </motion.h2>
            <motion.p
              className={styles.copy}
              style={reducedMotion ? undefined : { filter: copyBlur, opacity: copyOpacity, y: copyY }}
            >
              Answer 4 simple questions and Pluto will narrow down the AI tools that fit you best.
            </motion.p>
          </div>

          <div className={styles.timelineWrap}>
            <div className={styles.markerRow} aria-hidden="true">
              <span className={styles.timelineBase} />
              <motion.span className={styles.timelineActive} style={reducedMotion ? { scaleX: 1 } : { scaleX: lineScale }} />
              {guideSteps.map((_, index) => (
                <StepMarker index={index} key={index} progress={progress} reducedMotion={reducedMotion} />
              ))}
            </div>

            <div className={styles.desktopSteps}>
              {guideSteps.map((step, index) => (
                <StepCopy index={index} key={step.title} progress={progress} reducedMotion={reducedMotion} step={step} />
              ))}
            </div>

            <div className={styles.mobileStepPanel}>
              {guideSteps.map((step, index) => (
                <MobileStepCopy index={index} key={step.title} progress={progress} reducedMotion={reducedMotion} step={step} />
              ))}
            </div>

            <motion.div className={styles.ctaWrap} style={reducedMotion ? undefined : { opacity: ctaOpacity, y: ctaY }}>
              <Link className={styles.cta} href="/pluto-guides">
                <Sparkles aria-hidden="true" />
                Start Guide
                <ArrowRight aria-hidden="true" className={styles.ctaArrow} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ScrubArgs = {
  progress: MotionValue<number>;
  reducedMotion: boolean;
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  durationRef: MutableRefObject<number>;
  setVideoReady: (ready: boolean) => void;
};

function useScrollScrubbedVideo({ progress, reducedMotion, sectionRef, videoRef, durationRef, setVideoReady }: ScrubArgs) {
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let frameId = 0;
    let metadataReady = Number.isFinite(video.duration) && video.duration > 0;
    let isNearViewport = false;

    const stopLoop = () => {
      if (!frameId) return;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const tick = () => {
      frameId = 0;
      if (reducedMotion || !metadataReady || !isNearViewport) return;

      const duration = durationRef.current;
      const targetTime = duration * Math.min(1, Math.max(0, progress.get()));
      const delta = targetTime - video.currentTime;
      const nextTime = Math.abs(delta) < 0.018 ? targetTime : video.currentTime + delta * SMOOTHING_FACTOR;

      try {
        video.currentTime = Math.min(duration, Math.max(0, nextTime));
      } catch {
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (frameId || reducedMotion || !metadataReady || !isNearViewport) return;
      frameId = window.requestAnimationFrame(tick);
    };

    const handleMetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      metadataReady = true;
      durationRef.current = video.duration;
      video.pause();
      setVideoReady(true);

      if (reducedMotion) {
        try {
          video.currentTime = Math.min(0.2, video.duration);
        } catch {
          // The poster remains visible if the browser cannot seek this early.
        }
        return;
      }

      startLoop();
    };

    const handleLoadedData = () => setVideoReady(true);

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    if (video.readyState >= 1) handleMetadata();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = Boolean(entry?.isIntersecting);
        if (isNearViewport) startLoop();
        else stopLoop();
      },
      { rootMargin: "220px 0px" }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      stopLoop();
    };
  }, [durationRef, progress, reducedMotion, sectionRef, setVideoReady, videoRef]);
}

function StepMarker({ index, progress, reducedMotion }: { index: number; progress: MotionValue<number>; reducedMotion: boolean }) {
  const threshold = stepThresholds[index];
  const borderColor = useTransform(progress, [threshold - 0.03, threshold + 0.04], ["rgba(255,255,255,0.24)", "rgba(144,73,255,0.95)"]);
  const color = useTransform(progress, [threshold - 0.03, threshold + 0.04], ["rgba(255,255,255,0.72)", "#ffffff"]);
  const boxShadow = useTransform(progress, [threshold - 0.03, threshold + 0.04], ["0 0 0 rgba(144,73,255,0)", "0 0 22px rgba(144,73,255,0.58)"]);
  const backgroundColor = useTransform(progress, [threshold - 0.03, threshold + 0.04], ["rgba(7,5,16,0.74)", "rgba(18,9,35,0.86)"]);

  return (
    <span className={styles.markerCell}>
      <motion.span
        className={styles.marker}
        style={reducedMotion ? undefined : { backgroundColor, borderColor, boxShadow, color }}
      >
        {index + 1}
      </motion.span>
    </span>
  );
}

function StepCopy({ index, progress, reducedMotion, step }: { index: number; progress: MotionValue<number>; reducedMotion: boolean; step: (typeof guideSteps)[number] }) {
  const threshold = stepThresholds[index];
  const opacity = useTransform(progress, [threshold - 0.04, threshold + 0.05], [0, 1]);
  const y = useTransform(progress, [threshold - 0.04, threshold + 0.05], [12, 0]);
  const filter = useTransform(progress, [threshold - 0.04, threshold + 0.05], ["blur(4px)", "blur(0px)"]);

  return (
    <motion.div className={styles.stepCopy} style={reducedMotion ? undefined : { filter, opacity, y }}>
      <h3>{step.title}</h3>
      <p>{step.copy}</p>
    </motion.div>
  );
}

function MobileStepCopy({ index, progress, reducedMotion, step }: { index: number; progress: MotionValue<number>; reducedMotion: boolean; step: (typeof guideSteps)[number] }) {
  const ranges = getMobileStepRange(index);
  const opacity = useTransform(progress, ranges.input, ranges.output);
  const y = useTransform(progress, [ranges.input[0], ranges.input[1]], [10, 0]);
  const filter = useTransform(progress, [ranges.input[0], ranges.input[1]], ["blur(4px)", "blur(0px)"]);

  return (
    <motion.div className={styles.mobileStepCopy} style={reducedMotion ? undefined : { filter, opacity, y }}>
      <h3>{step.title}</h3>
      <p>{step.copy}</p>
    </motion.div>
  );
}

function getMobileStepRange(index: number) {
  if (index === 0) return { input: [0.2, 0.25, 0.34, 0.39], output: [0, 1, 1, 0] };
  if (index === 1) return { input: [0.35, 0.4, 0.49, 0.54], output: [0, 1, 1, 0] };
  if (index === 2) return { input: [0.5, 0.55, 0.64, 0.69], output: [0, 1, 1, 0] };
  return { input: [0.65, 0.7, 1], output: [0, 1, 1] };
}