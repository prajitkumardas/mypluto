"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { motion, type MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PlutoButton } from "@/components/ui/pluto-button";
import { categories, type Category } from "@/lib/data";
import styles from "./popular-categories-showcase.module.css";

const categoryDiscoverFilters: Record<string, string> = {
  audio: "ai-audio-and-music",
  business: "ai-business-and-productivity",
  creative: "ai-image-generation-and-design",
  development: "ai-coding-and-development",
  productivity: "ai-business-and-productivity",
  research: "ai-search-and-research",
  writing: "ai-writing-and-content"
};

const selectedCategorySlugs = ["writing", "creative", "development", "productivity", "research"];
const popularCategories = selectedCategorySlugs
  .map((slug) => categories.find((category) => category.slug === slug))
  .filter(Boolean) as Category[];

const springConfig = { stiffness: 110, damping: 26, mass: 0.85 };
const cardGap = 16;
const stackOffsets = [
  { x: -36, y: 22, rotate: -4, scale: 1 },
  { x: -18, y: 10, rotate: 3, scale: 0.99 },
  { x: 0, y: 0, rotate: -1, scale: 0.98 },
  { x: 20, y: -12, rotate: 4, scale: 0.97 },
  { x: 42, y: -24, rotate: -3, scale: 0.96 }
];
const fanOrder = [0.04, 0.02, 0, 0.02, 0.04];
const cardThemes = [
  { background: "#e9e5da", foreground: "#11121a", muted: "#5a5962", line: "rgba(17,18,26,0.14)", chip: "rgba(17,18,26,0.08)" },
  { background: "#6c4dff", foreground: "#ffffff", muted: "rgba(255,255,255,0.72)", line: "rgba(255,255,255,0.22)", chip: "rgba(255,255,255,0.14)" },
  { background: "#171923", foreground: "#ffffff", muted: "rgba(255,255,255,0.68)", line: "rgba(255,255,255,0.16)", chip: "rgba(255,255,255,0.09)" },
  { background: "#b7d7a8", foreground: "#101510", muted: "#40533c", line: "rgba(16,21,16,0.15)", chip: "rgba(16,21,16,0.08)" },
  { background: "#a9d8ee", foreground: "#101721", muted: "#405461", line: "rgba(16,23,33,0.15)", chip: "rgba(16,23,33,0.08)" }
];

export function PopularCategoriesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stageRef, stageWidth] = useElementWidth<HTMLDivElement>();
  const reducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const progress = useSpring(scrollYProgress, springConfig);
  const introOpacity = useTransform(progress, [0.34, 0.62], [1, 0]);
  const introY = useTransform(progress, [0.24, 0.62], [0, -24]);
  const introScale = useTransform(progress, [0.24, 0.62], [1, 0.96]);
  const finalCtaOpacity = useTransform(progress, [0.64, 0.8, 0.92], [0, 0.72, 1]);
  const finalCtaY = useTransform(progress, [0.64, 0.92], [24, 0]);

  return (
    <section
      aria-labelledby="popular-categories-title"
      className={`${styles.section} ${reducedMotion ? styles.staticSection : ""}`}
      id="categories"
      ref={sectionRef}
    >
      <div className={styles.stickyStage}>
        <div className={styles.inner}>
          <div className={styles.stageGrid}>
            <motion.div className={styles.intro} style={reducedMotion ? undefined : { opacity: introOpacity, y: introY, scale: introScale }}>
              <p className={styles.eyebrow}>Popular categories</p>
              <h1 className={styles.title} id="popular-categories-title">Find AI for whatever<br />you&apos;re building.</h1>
              <p className={styles.copy}>Explore tools by what you want to create, solve or automate.</p>
              <PlutoButton className={styles.introCta} href="/plutos-library" showArrow variant="secondary">
                View all categories
              </PlutoButton>
            </motion.div>

            {!reducedMotion ? (
              <div aria-label="Popular AI categories" className={styles.animationStage} ref={stageRef} role="region">
                {popularCategories.map((category, index) => (
                  <ScrollCategoryCard
                    category={category}
                    index={index}
                    key={category.slug}
                    progress={progress}
                    stageWidth={stageWidth}
                    total={popularCategories.length}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.mobileRail}>
            {popularCategories.map((category, index) => (
              <StaticCategoryCard category={category} index={index} key={category.slug} />
            ))}
          </div>

          {!reducedMotion ? (
            <motion.div className={styles.finalCtaWrap} style={{ opacity: finalCtaOpacity, y: finalCtaY }}>
              <PlutoButton className={styles.viewAll} href="/plutos-library" showArrow variant="secondary">
                View all categories
              </PlutoButton>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ScrollCategoryCard({ category, index, progress, stageWidth, total }: { category: Category; index: number; progress: MotionValue<number>; stageWidth: number; total: number }) {
  const width = getCardWidth(stageWidth);
  const height = getCardHeight(width);
  const rowScale = getRowScale(stageWidth, width, total);
  const initialGroupX = getInitialStackX(stageWidth);
  const lowerGroupX = getLowerStackX(stageWidth);
  const stackDrop = getStackDrop(stageWidth, height);
  const entryY = Math.min(720, Math.max(560, height * 1.45));
  const finalStep = width * rowScale + cardGap;
  const finalX = (index - (total - 1) / 2) * finalStep;
  const stack = stackOffsets[index];
  const entryStart = 0.04 + index * 0.095;
  const entryEnd = entryStart + 0.08;
  const fanStart = 0.66 + fanOrder[index];
  const fanEnd = 0.9 + fanOrder[index] * 0.5;
  const x = useSpring(
    useTransform(progress, [entryStart, entryEnd, 0.54, 0.64, fanStart, fanEnd, 0.96], [initialGroupX + stack.x, initialGroupX + stack.x, initialGroupX + stack.x, lowerGroupX + stack.x, lowerGroupX + stack.x, finalX, finalX]),
    springConfig
  );
  const y = useSpring(
    useTransform(progress, [entryStart, entryEnd, 0.54, 0.64, fanStart, fanEnd, 0.96], [entryY, stack.y, stack.y, stackDrop + stack.y, stackDrop + stack.y, 0, 0]),
    springConfig
  );
  const rotate = useSpring(useTransform(progress, [entryStart, entryEnd, fanStart, fanEnd, 0.96], [stack.rotate * 0.35, stack.rotate, stack.rotate, 0, 0]), springConfig);
  const scale = useSpring(useTransform(progress, [entryStart, entryEnd, fanStart, fanEnd, 0.96], [0.92, stack.scale, stack.scale, rowScale, rowScale]), springConfig);
  const opacity = useTransform(progress, [Math.max(0, entryStart - 0.03), entryStart, entryEnd], [0, 0, 1]);

  return (
    <motion.div
      className={styles.cardShell}
      style={{
        height,
        marginLeft: width / -2,
        marginTop: height / -2,
        opacity,
        rotate,
        scale,
        width,
        x,
        y,
        zIndex: index + 1
      }}
    >
      <CategoryCard category={category} index={index} />
    </motion.div>
  );
}

function StaticCategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <div className={styles.staticCardWrap}>
      <CategoryCard category={category} index={index} />
    </div>
  );
}

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const Icon = category.icon;
  const href = getCategoryDiscoverHref(category.slug);
  const theme = cardThemes[index % cardThemes.length];

  return (
    <Link
      aria-label={`Explore ${category.name}`}
      className={styles.card}
      href={href}
      style={{
        "--card-bg": theme.background,
        "--card-fg": theme.foreground,
        "--card-muted": theme.muted,
        "--card-line": theme.line,
        "--card-chip": theme.chip,
        "--category-accent": category.accent
      } as CSSProperties}
    >
      <span className={styles.cardTopline}>
        <span>{getDisplayTitle(category)}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </span>
      <span className={styles.iconWrap}><Icon aria-hidden="true" /></span>
      <span className={styles.cardHeadline}>{getCardHeadline(category)}</span>
      <span className={styles.cardCopy}>{category.description}</span>
      <span className={styles.cardTags}>
        {category.subcategories.slice(0, 3).map((subcategory) => (
          <span key={subcategory}>{subcategory}</span>
        ))}
      </span>
      <span className={styles.cardFooter}>
        Explore <ArrowRight aria-hidden="true" />
      </span>
    </Link>
  );
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const updateWidth = () => setWidth(ref.current?.clientWidth ?? 0);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function getCardWidth(stageWidth: number) {
  if (!stageWidth) return 300;
  return Math.min(340, Math.max(300, stageWidth * 0.25));
}

function getCardHeight(width: number) {
  return Math.min(450, Math.max(410, width * 1.34));
}

function getRowScale(stageWidth: number, width: number, total: number) {
  if (!stageWidth) return 1;
  const availableWidth = Math.max(0, stageWidth - cardGap * (total - 1));
  return Math.min(1, availableWidth / (width * total));
}

function getInitialStackX(stageWidth: number) {
  if (!stageWidth) return 220;
  return Math.min(350, Math.max(230, stageWidth * 0.24));
}

function getLowerStackX(stageWidth: number) {
  if (!stageWidth) return 45;
  return Math.min(70, Math.max(16, stageWidth * 0.035));
}

function getStackDrop(stageWidth: number, height: number) {
  if (!stageWidth) return 210;
  return Math.min(238, Math.max(175, height * 0.46));
}

function getDisplayTitle(category: Category) {
  switch (category.slug) {
    case "writing":
      return "Text & Writing";
    case "creative":
      return "Image & Video";
    case "development":
      return "Coding";
    default:
      return category.name;
  }
}

function getCardHeadline(category: Category) {
  switch (category.slug) {
    case "writing":
      return "Draft cleaner copy.";
    case "creative":
      return "Turn ideas into visuals.";
    case "development":
      return "Build and debug faster.";
    case "productivity":
      return "Automate busy work.";
    case "research":
      return "Find cited answers.";
    default:
      return category.description;
  }
}

function getCategoryDiscoverHref(categorySlug: string) {
  const discoverCategory = categoryDiscoverFilters[categorySlug];
  return discoverCategory ? `/plutos-library?category=${discoverCategory}` : "/plutos-library";
}
