"use client";

import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useTransform
} from "motion/react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

// Component created by Dominik Koch
// https://x.com/dominikkoch

type OrbitShape =
  | "ellipse"
  | "circle"
  | "square"
  | "rectangle"
  | "triangle"
  | "star"
  | "heart"
  | "infinity"
  | "wave"
  | "custom";

interface OrbitImagesProps {
  images?: string[];
  items?: ReactNode[];
  altPrefix?: string;
  shape?: OrbitShape;
  customPath?: string;
  baseWidth?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  starPoints?: number;
  starInnerRatio?: number;
  rotation?: number;
  duration?: number;
  itemSize?: number;
  itemWidth?: number;
  itemHeight?: number;
  direction?: "normal" | "reverse";
  fill?: boolean;
  width?: number | "100%";
  height?: number | "auto" | "100%";
  className?: string;
  itemClassName?: string;
  centerClassName?: string;
  showPath?: boolean;
  pathColor?: string;
  pathWidth?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  paused?: boolean;
  centerContent?: ReactNode;
  responsive?: boolean;
  ariaHidden?: boolean;
}

interface OrbitItemProps {
  item: ReactNode;
  index: number;
  totalItems: number;
  path: string;
  itemWidth: number;
  itemHeight: number;
  itemClassName: string;
  rotation: number;
  progress: MotionValue<number>;
  fill: boolean;
}

function generateEllipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx: number, cy: number, r: number): string {
  return generateEllipsePath(cx, cy, r, r);
}

function generateSquarePath(cx: number, cy: number, size: number): string {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function generateRectanglePath(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function generateTrianglePath(cx: number, cy: number, size: number): string {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function generateStarPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points;
  let path = "";

  for (let index = 0; index < 2 * points; index += 1) {
    const r = index % 2 === 0 ? outerR : innerR;
    const angle = index * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return `${path} Z`;
}

function generateHeartPath(cx: number, cy: number, size: number): string {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function generateInfinityPath(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function generateWavePath(cx: number, cy: number, w: number, amplitude: number, waves: number): string {
  const pts: string[] = [];
  const segs = waves * 20;
  const hw = w / 2;

  for (let index = 0; index <= segs; index += 1) {
    const x = cx - hw + (w * index) / segs;
    const y = cy + Math.sin((index / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  for (let index = segs; index >= 0; index -= 1) {
    const x = cx - hw + (w * index) / segs;
    const y = cy - Math.sin((index / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(`L ${x} ${y}`);
  }

  return `${pts.join(" ")} Z`;
}

function OrbitItem({ item, index, totalItems, path, itemWidth, itemHeight, itemClassName, rotation, progress, fill }: OrbitItemProps) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;
  const offsetDistance = useTransform(progress, (p: number) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100;
    return `${offset}%`;
  });

  return (
    <motion.div
      className={`absolute select-none will-change-transform ${itemClassName}`}
      style={{
        width: itemWidth,
        height: itemHeight,
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        offsetDistance
      }}
    >
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  items,
  altPrefix = "Orbiting image",
  shape = "ellipse",
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  itemWidth = itemSize,
  itemHeight = itemSize,
  direction = "normal",
  fill = true,
  width = 100,
  height = 100,
  className = "",
  itemClassName = "",
  centerClassName = "",
  showPath = false,
  pathColor = "rgba(0,0,0,0.1)",
  pathWidth = 2,
  easing = "linear",
  paused = false,
  centerContent,
  responsive = false,
  ariaHidden = true
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case "circle":
        return generateCirclePath(designCenterX, designCenterY, radius);
      case "ellipse":
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
      case "square":
        return generateSquarePath(designCenterX, designCenterY, radius * 2);
      case "rectangle":
        return generateRectanglePath(designCenterX, designCenterY, radiusX * 2, radiusY * 2);
      case "triangle":
        return generateTrianglePath(designCenterX, designCenterY, radius * 2);
      case "star":
        return generateStarPath(designCenterX, designCenterY, radius, radius * starInnerRatio, starPoints);
      case "heart":
        return generateHeartPath(designCenterX, designCenterY, radius * 2);
      case "infinity":
        return generateInfinityPath(designCenterX, designCenterY, radiusX * 2, radiusY * 2);
      case "wave":
        return generateWavePath(designCenterX, designCenterY, radiusX * 2, radiusY, 3);
      case "custom":
        return customPath || generateCirclePath(designCenterX, designCenterY, radius);
      default:
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
    }
  }, [shape, customPath, designCenterX, designCenterY, radiusX, radiusY, radius, starPoints, starInnerRatio]);

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const progress = useMotionValue(0);

  useEffect(() => {
    if (paused) return;

    const controls = animate(progress, direction === "reverse" ? -100 : 100, {
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: "loop"
    });

    return () => controls.stop();
  }, [progress, duration, easing, direction, paused]);

  const containerWidth = responsive ? "100%" : typeof width === "number" ? width : "100%";
  const containerHeight = responsive ? height : typeof height === "number" ? height : typeof width === "number" ? width : "auto";

  const orbitItems = items ?? images.map((src, index) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={`${altPrefix} ${index + 1}`}
      className="h-full w-full object-contain"
      draggable={false}
      key={src}
      src={src}
    />
  ));

  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className={`relative mx-auto ${className}`}
      ref={containerRef}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive && height === "auto" ? "1 / 1" : undefined
      }}
    >
      <div
        className={responsive ? "absolute left-1/2 top-1/2" : "relative h-full w-full"}
        style={{
          width: responsive ? baseWidth : "100%",
          height: responsive ? baseWidth : "100%",
          transform: responsive && scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: responsive && scale === null ? "hidden" : undefined,
          transformOrigin: "center center"
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center"
          }}
        >
          {showPath ? (
            <svg className="pointer-events-none absolute inset-0" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`} width="100%">
              <path d={path} fill="none" stroke={pathColor} strokeWidth={pathWidth / (scale ?? 1)} />
            </svg>
          ) : null}

          {orbitItems.map((item, index) => (
            <OrbitItem
              fill={fill}
              index={index}
              item={item}
              itemClassName={itemClassName}
              itemHeight={itemHeight}
              itemWidth={itemWidth}
              key={index}
              path={path}
              progress={progress}
              rotation={rotation}
              totalItems={orbitItems.length}
            />
          ))}
        </div>
      </div>

      {centerContent ? (
        <div className={`absolute inset-0 z-10 flex items-center justify-center ${centerClassName}`}>
          {centerContent}
        </div>
      ) : null}
    </div>
  );
}