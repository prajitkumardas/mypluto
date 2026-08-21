"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./pluto-hero.module.css";

type CatDirection =
  | "center"
  | "left"
  | "top-left"
  | "up"
  | "top-right"
  | "right"
  | "bottom-right"
  | "down"
  | "bottom-left";

const CAT_CONFIG = {
  centerDeadZone: 0.18,
  hysteresis: 0.08,
  movementEpsilon: 0.008,
  smoothing: 0.075,
  focusedInputSmoothing: 0.035,
  seekIntervalMs: 48,
  seekThresholdSeconds: 0.018,
  seekSupersedeMs: 140,
  idleReturnDelayMs: 5600,
  maxMicroOffsetX: 3,
  maxMicroOffsetY: 2,
  greetingEndSeconds: 1.1,
  greetingMaxMs: 1900
};

const CAT_TIMELINE: Record<CatDirection, number> = {
  center: 0.35,
  left: 1.2,
  "top-left": 2.05,
  up: 2.9,
  "top-right": 3.75,
  right: 4.6,
  "bottom-right": 5.45,
  down: 6.3,
  "bottom-left": 7.15
};

const CAT_VIDEO_SRC = "/animations/pluto-cat.mp4";
const CANVAS_MAX_WIDTH = 640;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getCatDirection(x: number, y: number, previousDirection: CatDirection = "center"): CatDirection {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const centerDeadZone =
    previousDirection === "center" ? CAT_CONFIG.centerDeadZone + CAT_CONFIG.hysteresis : CAT_CONFIG.centerDeadZone;

  if (absX < centerDeadZone && absY < centerDeadZone) {
    return "center";
  }

  const axisGap = CAT_CONFIG.hysteresis * 1.6;
  let nextDirection: CatDirection;

  if (absX > absY + axisGap) {
    nextDirection = x < 0 ? "left" : "right";
  } else if (absY > absX + axisGap) {
    nextDirection = y < 0 ? "up" : "down";
  } else if (x < 0 && y < 0) {
    nextDirection = "top-left";
  } else if (x > 0 && y < 0) {
    nextDirection = "top-right";
  } else if (x > 0 && y > 0) {
    nextDirection = "bottom-right";
  } else {
    nextDirection = "bottom-left";
  }

  if (
    previousDirection !== "center" &&
    nextDirection !== previousDirection &&
    Math.max(absX, absY) < CAT_CONFIG.centerDeadZone + CAT_CONFIG.hysteresis
  ) {
    return previousDirection;
  }

  return nextDirection;
}

function resolveTimelineTime(direction: CatDirection, duration: number) {
  const configuredTime = CAT_TIMELINE[direction];
  const maxConfiguredTime = Math.max(...Object.values(CAT_TIMELINE));
  const safeDuration = Number.isFinite(duration) && duration > 0 ? Math.max(0, duration - 0.04) : maxConfiguredTime;
  const scaledTime = maxConfiguredTime > safeDuration ? configuredTime * (safeDuration / maxConfiguredTime) : configuredTime;

  return clamp(scaledTime, 0, safeDuration);
}

function prepareMascotCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const sourceWidth = video.videoWidth || 543;
  const sourceHeight = video.videoHeight || 760;
  const ratio = Math.min(1, CANVAS_MAX_WIDTH / sourceWidth);
  const width = Math.max(1, Math.round(sourceWidth * ratio));
  const height = Math.max(1, Math.round(sourceHeight * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function isLikelyBackgroundPixel(
  red: number,
  green: number,
  blue: number,
  backgroundRed: number,
  backgroundGreen: number,
  backgroundBlue: number
) {
  const colorDistance = Math.hypot(red - backgroundRed, green - backgroundGreen, blue - backgroundBlue);
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const saturation = maxChannel - minChannel;

  return colorDistance < 58 || (minChannel > 218 && saturation < 42);
}

function drawMattedFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  if (!video.videoWidth || !video.videoHeight || !canvas.width || !canvas.height) return;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = frame;
  const backgroundRed = data[0] ?? 255;
  const backgroundGreen = data[1] ?? 255;
  const backgroundBlue = data[2] ?? 255;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) return;

    const dataIndex = pixelIndex * 4;
    if (
      data[dataIndex + 3] > 0 &&
      isLikelyBackgroundPixel(
        data[dataIndex],
        data[dataIndex + 1],
        data[dataIndex + 2],
        backgroundRed,
        backgroundGreen,
        backgroundBlue
      )
    ) {
      visited[pixelIndex] = 1;
      queue.push(pixelIndex);
    }
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const pixelIndex = queue.pop() as number;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    data[pixelIndex * 4 + 3] = 0;

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  context.putImageData(frame, 0, 0);
}

type InteractivePlutoProps = {
  active?: boolean;
};

export function InteractivePluto({ active = true }: InteractivePlutoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const durationRef = useRef(8);
  const pointerRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, lastMovedAt: 0 });
  const targetTimeRef = useRef(CAT_TIMELINE.center);
  const displayedTimeRef = useRef(CAT_TIMELINE.center);
  const lastSeekAtRef = useRef(0);
  const isSeekingRef = useRef(false);
  const lastDirectionRef = useRef<CatDirection>("center");
  const inputFocusedRef = useRef(false);
  const greetingActiveRef = useRef(false);
  const greetingEndsAtRef = useRef(0);
  const lastDrawnTimeRef = useRef(-1);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!active || !frame || !video || !canvas || !videoReady || videoFailed || reducedMotion) return;

    const hero = frame.closest("section") ?? frame;
    const pointerQuery = window.matchMedia("(pointer: fine)");
    let running = true;

    const returnToCenter = () => {
      lastDirectionRef.current = "center";
      targetTimeRef.current = resolveTimelineTime("center", durationRef.current);
    };

    const setTargetDirection = (x: number, y: number) => {
      const direction = inputFocusedRef.current ? "center" : getCatDirection(x, y, lastDirectionRef.current);

      lastDirectionRef.current = direction;
      targetTimeRef.current = resolveTimelineTime(direction, durationRef.current);
    };

    const updatePointer = (clientX: number, clientY: number, referenceElement: Element) => {
      const rect = referenceElement.getBoundingClientRect();
      const nextX = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const nextY = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      const distanceX = Math.abs(nextX - pointerRef.current.lastX);
      const distanceY = Math.abs(nextY - pointerRef.current.lastY);

      if (distanceX < CAT_CONFIG.movementEpsilon && distanceY < CAT_CONFIG.movementEpsilon) return;

      pointerRef.current = {
        x: nextX,
        y: nextY,
        lastX: nextX,
        lastY: nextY,
        lastMovedAt: performance.now()
      };
      setTargetDirection(nextX, nextY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerQuery.matches || event.pointerType === "touch") return;
      updatePointer(event.clientX, event.clientY, hero);
    };

    const handleFocusIn = (event: Event) => {
      const target = event.target;

      if (target instanceof HTMLElement && target.matches("input, textarea, [contenteditable='true']")) {
        inputFocusedRef.current = true;
        returnToCenter();
      }
    };

    const handleFocusOut = () => {
      inputFocusedRef.current = false;
    };

    const stopLoop = () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const seekTowardTarget = (now: number) => {
      const idleTime = now - pointerRef.current.lastMovedAt;

      if (idleTime > CAT_CONFIG.idleReturnDelayMs) {
        returnToCenter();
      }

      const smoothing = inputFocusedRef.current ? CAT_CONFIG.focusedInputSmoothing : CAT_CONFIG.smoothing;
      displayedTimeRef.current += (targetTimeRef.current - displayedTimeRef.current) * smoothing;

      frame.style.setProperty(
        "--pluto-offset-x",
        `${inputFocusedRef.current ? 0 : pointerRef.current.x * CAT_CONFIG.maxMicroOffsetX}px`
      );
      frame.style.setProperty(
        "--pluto-offset-y",
        `${inputFocusedRef.current ? 0 : pointerRef.current.y * CAT_CONFIG.maxMicroOffsetY}px`
      );

      const canSeek =
        !isSeekingRef.current ||
        now - lastSeekAtRef.current > CAT_CONFIG.seekSupersedeMs ||
        Math.abs(video.currentTime - displayedTimeRef.current) > 0.18;

      if (
        canSeek &&
        now - lastSeekAtRef.current > CAT_CONFIG.seekIntervalMs &&
        Math.abs(video.currentTime - displayedTimeRef.current) > CAT_CONFIG.seekThresholdSeconds
      ) {
        isSeekingRef.current = true;
        lastSeekAtRef.current = now;
        video.currentTime = displayedTimeRef.current;
      }
    };

    const drawCurrentFrame = () => {
      if (Math.abs(video.currentTime - lastDrawnTimeRef.current) < 0.002 && !greetingActiveRef.current) return;

      prepareMascotCanvas(video, canvas);
      drawMattedFrame(video, canvas);
      lastDrawnTimeRef.current = video.currentTime;
    };

    const tick = (now: number) => {
      rafRef.current = null;
      if (!running || document.visibilityState === "hidden") return;

      if (greetingActiveRef.current) {
        if (video.currentTime >= CAT_CONFIG.greetingEndSeconds || now >= greetingEndsAtRef.current) {
          greetingActiveRef.current = false;
          video.pause();
          returnToCenter();
          displayedTimeRef.current = targetTimeRef.current;
          video.currentTime = targetTimeRef.current;
        }
      } else {
        seekTowardTarget(now);
      }

      drawCurrentFrame();
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafRef.current && document.visibilityState === "visible") {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        video.pause();
        stopLoop();
        return;
      }

      startLoop();
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      drawCurrentFrame();
    };

    const startGreeting = () => {
      const alreadyGreeted = sessionStorage.getItem("plutoHeroGreeted") === "true";

      if (alreadyGreeted) {
        returnToCenter();
        displayedTimeRef.current = targetTimeRef.current;
        video.currentTime = targetTimeRef.current;
        drawCurrentFrame();
        startLoop();
        return;
      }

      greetingActiveRef.current = true;
      greetingEndsAtRef.current = performance.now() + CAT_CONFIG.greetingMaxMs;
      sessionStorage.setItem("plutoHeroGreeted", "true");
      video.currentTime = 0;
      void video.play().catch(() => {
        greetingActiveRef.current = false;
        returnToCenter();
      });
      startLoop();
    };

    video.addEventListener("seeked", handleSeeked);
    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", returnToCenter);
    hero.addEventListener("focusin", handleFocusIn);
    hero.addEventListener("focusout", handleFocusOut);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startGreeting();

    return () => {
      running = false;
      stopLoop();
      video.pause();
      video.removeEventListener("seeked", handleSeeked);
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", returnToCenter);
      hero.removeEventListener("focusin", handleFocusIn);
      hero.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, reducedMotion, videoFailed, videoReady]);

  const showVideo = videoReady && !videoFailed && !reducedMotion;
  const frameClassName = showVideo ? `${styles.plutoFrame} ${styles.plutoFrameReady}` : styles.plutoFrame;

  return (
    <div aria-hidden="true" className={frameClassName} ref={frameRef}>
      <video
        className={styles.plutoVideo}
        disablePictureInPicture
        muted
        onCanPlay={(event) => {
          const video = event.currentTarget;
          const canvas = canvasRef.current;

          if (canvas) {
            prepareMascotCanvas(video, canvas);
            drawMattedFrame(video, canvas);
            lastDrawnTimeRef.current = video.currentTime;
          }

          setVideoReady(true);
        }}
        onError={() => setVideoFailed(true)}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;

          durationRef.current = video.duration;
          targetTimeRef.current = resolveTimelineTime("center", video.duration);
          displayedTimeRef.current = targetTimeRef.current;
          video.currentTime = targetTimeRef.current;
        }}
        playsInline
        preload="metadata"
        ref={videoRef}
      >
        <source src={CAT_VIDEO_SRC} type="video/mp4" />
      </video>
      <canvas className={styles.plutoCanvas} ref={canvasRef} />
    </div>
  );
}
