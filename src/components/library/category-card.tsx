"use client";

import { useCallback, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  Atom,
  Bot,
  Briefcase,
  Building2,
  Camera,
  Car,
  Code2,
  Cpu,
  Database,
  DollarSign,
  Factory,
  Gamepad2,
  Globe2,
  GraduationCap,
  HeartPulse,
  Home,
  ImageIcon,
  Leaf,
  Megaphone,
  MessageCircle,
  Music,
  Newspaper,
  Palette,
  PenLine,
  Presentation,
  Scale,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Video,
  Wand2,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LibraryCategory } from "@/lib/plutos-library";
import styles from "./category-card.module.css";

const categoryIcons: Record<string, LucideIcon> = {
  "ai-assistants-and-chatbots": Bot,
  "ai-writing-and-content": PenLine,
  "ai-image-generation-and-design": ImageIcon,
  "ai-video": Video,
  "ai-audio-and-music": Music,
  "ai-coding-and-development": Code2,
  "ai-business-and-productivity": Briefcase,
  "ai-marketing-and-sales": Megaphone,
  "ai-data-and-analytics": Database,
  "ai-search-and-research": Search,
  "ai-education": GraduationCap,
  "ai-legal": Scale,
  "ai-healthcare-and-medical": HeartPulse,
  "ai-finance-and-accounting": DollarSign,
  "ai-e-commerce-and-shopping": ShoppingCart,
  "ai-real-estate": Home,
  "ai-human-resources-and-recruitment": Users,
  "ai-communication": MessageCircle,
  "ai-presentations-and-documents": Presentation,
  "ai-meetings-and-collaboration": Globe2,
  "ai-design-and-ui-ux": Palette,
  "ai-cybersecurity": ShieldCheck,
  "ai-science-and-engineering": Atom,
  "ai-robotics": Cpu,
  "ai-automotive-and-transportation": Car,
  "ai-gaming": Gamepad2,
  "ai-lifestyle-and-personal": Sparkles,
  "ai-photography": Camera,
  "ai-industry-and-manufacturing": Factory,
  "ai-agriculture-and-environment": Leaf,
  "ai-news-and-media": Newspaper,
  "ai-automation-and-no-code": Workflow,
  "ai-developer-infrastructure": Server,
  "ai-prompt-engineering": Wand2,
  "ai-enterprise-solutions": Building2,
  "ai-web-and-internet-tools": Globe2,
  "ai-safety-ethics-and-governance": ShieldAlert
};

const accents = ["#7c63ff", "#55e6d4", "#c8ff5a", "#b9a7ff", "#ffbd59", "#61dca5", "#ff7f7f"];

type MousePosition = {
  x: number;
  y: number;
};

type CardStyle = CSSProperties & {
  "--category-accent": string;
  "--glow-x": string;
  "--glow-y": string;
  "--glow-intensity": number;
  "--glow-radius": string;
};

function pickAccent(slug: string) {
  const hash = Array.from(slug).reduce((total, character) => total + character.charCodeAt(0), 0);
  return accents[hash % accents.length];
}

export function CategoryCard({ category }: { category: LibraryCategory }) {
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const Icon = useMemo(() => categoryIcons[category.slug] ?? Sparkles, [category.slug]);
  const accent = useMemo(() => pickAccent(category.slug), [category.slug]);
  const toolsAvailable = useMemo(() => new Intl.NumberFormat("en-US").format(category.toolCount), [category.toolCount]);

  const handleMove = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePosition({
      x: (x / rect.width - 0.5) * 16,
      y: (y / rect.height - 0.5) * -16
    });
    setSpotlight({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  }, [prefersReducedMotion]);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => {
    setHovered(false);
    setMousePosition({ x: 0, y: 0 });
    setSpotlight({ x: 50, y: 50 });
  }, []);

  const cardStyle: CardStyle = {
    "--category-accent": accent,
    "--glow-x": `${spotlight.x}%`,
    "--glow-y": `${spotlight.y}%`,
    "--glow-intensity": hovered ? 1 : 0,
    "--glow-radius": "240px",
    transformStyle: "preserve-3d"
  };

  return (
    <motion.div
      className="h-full"
      animate={
        prefersReducedMotion
          ? { scale: 1 }
          : {
              rotateX: mousePosition.y,
              rotateY: mousePosition.x,
              scale: hovered ? 1.01 : 1,
              y: hovered ? -3 : 0
            }
      }
      transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      <Link
        aria-label={`View ${category.name}, ${toolsAvailable} tools available`}
        className={`focus-ring flex h-full flex-col justify-between p-5 ${styles.card}`}
        href={`/plutos-library/${category.slug}`}
        onBlur={handleLeave}
        onFocus={handleEnter}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
        style={cardStyle}
      >
        <span className={styles.cardBody}>
          <span className={styles.iconWrap}>
            <Icon aria-hidden="true" className={styles.icon} />
          </span>
          <span>
            <span className={styles.cardTitle}>{category.name}</span>
            <span className={styles.count}>{toolsAvailable} tools available</span>
          </span>
        </span>

        <span className={styles.cardFooter}>
          <span className={styles.action}>View tools</span>
        </span>
      </Link>
    </motion.div>
  );
}



