"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./pluto-hero.module.css";

const PARTICLE_COUNT = 8_000;
const SEQUENCE_DURATION = 4.85;
const PARTICLE_MARK_SRC = "/images/home/pluto-particle-mark.png";

type ParticleTargets = {
  origin: Float32Array;
  text: Float32Array;
  logo: Float32Array;
  exit: Float32Array;
  textDelays: Float32Array;
  logoDelays: Float32Array;
  exitDelays: Float32Array;
  sizes: Float32Array;
  tones: Float32Array;
};

type PixelPoint = {
  x: number;
  y: number;
};

type HeroParticleIntroProps = {
  onSequenceComplete: () => void;
};

export function HeroParticleIntro({ onSequenceComplete }: HeroParticleIntroProps) {
  const [targets, setTargets] = useState<ParticleTargets | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function prepareTargets() {
      const prepared = await createParticleTargets(PARTICLE_COUNT);
      if (!cancelled) setTargets(prepared);
    }

    prepareTargets().catch(() => {
      if (!cancelled) onSequenceComplete();
    });

    return () => {
      cancelled = true;
    };
  }, [onSequenceComplete]);

  return (
    <div aria-hidden="true" className={styles.particleIntroCanvas}>
      {targets ? (
        <Canvas
          camera={{ fov: 45, position: [0, 0, 10] }}
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        >
          <ParticleMorph onComplete={onSequenceComplete} targets={targets} />
        </Canvas>
      ) : (
        <span className={styles.particleIntroLoading} />
      )}
    </div>
  );
}

function ParticleMorph({ onComplete, targets }: { onComplete: () => void; targets: ParticleTargets }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);
  const { gl, size, viewport } = useThree();

  const uniforms = useMemo(() => ({
    uPointSize: { value: 20 },
    uTime: { value: 0 }
  }), []);

  useFrame((_, delta) => {
    const elapsed = Math.min(elapsedRef.current + Math.min(delta, 0.05), SEQUENCE_DURATION);
    elapsedRef.current = elapsed;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed;
      materialRef.current.uniforms.uPointSize.value = Math.min(size.width, size.height) * 0.03 * gl.getPixelRatio();
    }

    if (pointsRef.current) {
      const responsiveScale = Math.min(1, viewport.width / 13.4, viewport.height / 8.2);
      pointsRef.current.scale.setScalar(responsiveScale);
    }

    if (elapsed >= SEQUENCE_DURATION && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <points frustumCulled={false} ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[targets.origin, 3]} />
        <bufferAttribute attach="attributes-aText" args={[targets.text, 3]} />
        <bufferAttribute attach="attributes-aLogo" args={[targets.logo, 3]} />
        <bufferAttribute attach="attributes-aExit" args={[targets.exit, 3]} />
        <bufferAttribute attach="attributes-aTextDelay" args={[targets.textDelays, 1]} />
        <bufferAttribute attach="attributes-aLogoDelay" args={[targets.logoDelays, 1]} />
        <bufferAttribute attach="attributes-aExitDelay" args={[targets.exitDelays, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[targets.sizes, 1]} />
        <bufferAttribute attach="attributes-aTone" args={[targets.tones, 1]} />
      </bufferGeometry>
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </points>
  );
}

async function createParticleTargets(count: number): Promise<ParticleTargets> {
  const random = createSeededRandom(0x504c5554);
  const [text, logo] = await Promise.all([
    createTextPositions("Pluto Finds", count, random),
    createLogoPositions(PARTICLE_MARK_SRC, count, random)
  ]);
  const origin = createScatterPositions(count, random);
  const exit = createExitPositions(logo, count, random);
  const sizes = new Float32Array(count);
  const tones = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    sizes[index] = 0.72 + random() * 1.05;
    tones[index] = random();
  }

  return {
    origin,
    text,
    logo,
    exit,
    textDelays: createOrderedDelays(text, count, random),
    logoDelays: createRadialDelays(logo, count, random),
    exitDelays: createOrderedDelays(exit, count, random, true),
    sizes,
    tones
  };
}

function createScatterPositions(count: number, random: () => number) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = Math.cbrt(random());
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius * 9.5;
    positions[index * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 5.6;
    positions[index * 3 + 2] = Math.cos(phi) * radius * 3.2;
  }

  return positions;
}

async function createTextPositions(text: string, count: number, random: () => number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1_600;
  canvas.height = 480;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to prepare particle text");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = "700 248px 'Bricolage Grotesque', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return positionsFromCanvas(context, canvas.width, canvas.height, count, 12.4, random);
}

async function createLogoPositions(src: string, count: number, random: () => number) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to prepare particle logo");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 18, 18, canvas.width - 36, canvas.height - 36);

  return positionsFromCanvas(context, canvas.width, canvas.height, count, 7.4, random);
}

function positionsFromCanvas(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  worldWidth: number,
  random: () => number
) {
  const pixels = context.getImageData(0, 0, width, height).data;
  const points: PixelPoint[] = [];
  const step = width > 1_000 ? 3 : 2;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha > 52) points.push({ x, y });
    }
  }

  if (points.length === 0) throw new Error("Particle target has no visible pixels");

  const positions = new Float32Array(count * 3);
  const scale = worldWidth / width;

  for (let index = 0; index < count; index += 1) {
    const point = points[Math.floor(random() * points.length)];
    const jitter = scale * 1.6;
    positions[index * 3] = (point.x - width / 2) * scale + (random() - 0.5) * jitter;
    positions[index * 3 + 1] = -(point.y - height / 2) * scale + (random() - 0.5) * jitter;
    positions[index * 3 + 2] = (random() - 0.5) * 0.24;
  }

  return positions;
}

function createExitPositions(logo: Float32Array, count: number, random: () => number) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const x = logo[index * 3];
    const y = logo[index * 3 + 1];
    const angle = Math.atan2(y, x) + (random() - 0.5) * 0.75;
    const radius = 11 + random() * 7;
    positions[index * 3] = Math.cos(angle) * radius + (random() - 0.5) * 3;
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.64 + (random() - 0.5) * 2;
    positions[index * 3 + 2] = (random() - 0.5) * 8;
  }

  return positions;
}

function createOrderedDelays(
  positions: Float32Array,
  count: number,
  random: () => number,
  reverse = false
) {
  const delays = new Float32Array(count);
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < count; index += 1) {
    const x = positions[index * 3];
    minimum = Math.min(minimum, x);
    maximum = Math.max(maximum, x);
  }

  const range = maximum - minimum || 1;
  for (let index = 0; index < count; index += 1) {
    const ordered = (positions[index * 3] - minimum) / range;
    delays[index] = (reverse ? 1 - ordered : ordered) * 0.76 + random() * 0.24;
  }

  return delays;
}

function createRadialDelays(positions: Float32Array, count: number, random: () => number) {
  const delays = new Float32Array(count);
  let maximumRadius = 0;

  for (let index = 0; index < count; index += 1) {
    const x = positions[index * 3];
    const y = positions[index * 3 + 1];
    maximumRadius = Math.max(maximumRadius, Math.hypot(x, y));
  }

  for (let index = 0; index < count; index += 1) {
    const x = positions[index * 3];
    const y = positions[index * 3 + 1];
    delays[index] = (Math.hypot(x, y) / (maximumRadius || 1)) * 0.72 + random() * 0.28;
  }

  return delays;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load particle mark: ${src}`));
    image.src = src;
  });
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const vertexShader = `
  attribute vec3 aText;
  attribute vec3 aLogo;
  attribute vec3 aExit;
  attribute float aTextDelay;
  attribute float aLogoDelay;
  attribute float aExitDelay;
  attribute float aSize;
  attribute float aTone;

  uniform float uTime;
  uniform float uPointSize;

  varying float vAlpha;
  varying float vTone;

  float easeInOutCubic(float value) {
    return value < 0.5
      ? 4.0 * value * value * value
      : 1.0 - pow(-2.0 * value + 2.0, 3.0) / 2.0;
  }

  void main() {
    float textProgress = easeInOutCubic(clamp((uTime - 0.08 - aTextDelay * 0.34) / 0.96, 0.0, 1.0));
    float logoProgress = easeInOutCubic(clamp((uTime - 1.72 - aLogoDelay * 0.36) / 1.08, 0.0, 1.0));
    float exitProgress = easeInOutCubic(clamp((uTime - 3.72 - aExitDelay * 0.24) / 0.84, 0.0, 1.0));

    vec3 particlePosition = mix(position, aText, textProgress);
    particlePosition = mix(particlePosition, aLogo, logoProgress);
    particlePosition = mix(particlePosition, aExit, exitProgress);
    particlePosition.z += sin(uTime * 2.1 + aTone * 17.0) * 0.035 * (1.0 - exitProgress);

    vec4 modelPosition = modelViewMatrix * vec4(particlePosition, 1.0);
    gl_PointSize = clamp(uPointSize * aSize / max(1.0, -modelPosition.z), 1.0, 5.2);
    gl_Position = projectionMatrix * modelPosition;

    float arrivalAlpha = mix(0.18, 1.0, smoothstep(0.0, 0.7, textProgress));
    vAlpha = arrivalAlpha * (1.0 - smoothstep(0.08, 0.94, exitProgress));
    vTone = aTone;
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying float vTone;

  void main() {
    vec2 centered = gl_PointCoord * 2.0 - 1.0;
    float radius = dot(centered, centered);
    if (radius > 1.0) discard;

    float core = 1.0 - smoothstep(0.0, 0.42, radius);
    float dust = 1.0 - smoothstep(0.34, 1.0, radius);
    vec3 violet = vec3(0.68, 0.52, 1.0);
    vec3 white = vec3(1.0);
    vec3 color = mix(violet, white, smoothstep(0.18, 0.92, vTone));
    float alpha = (core * 0.82 + dust * 0.34) * vAlpha;

    gl_FragColor = vec4(color, alpha);
  }
`;
