"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Atom,
  Bot,
  Briefcase,
  Building2,
  Camera,
  Car,
  ChevronLeft,
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
import { cn } from "@/lib/utils";

type CategoryNavigationProps = {
  categories: LibraryCategory[];
  currentCategorySlug: string;
  linkMode?: "path" | "query";
  showAllTools?: boolean;
  variant?: "rail" | "section";
};

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

export function CategoryNavigation({
  categories,
  currentCategorySlug,
  linkMode = "path",
  showAllTools = false,
  variant = "rail"
}: CategoryNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const getCategoryHref = (slug: string) =>
    linkMode === "query" ? `/plutos-library?category=${slug}` : `/plutos-library/${slug}`;

  return (
    <aside
      className={cn(
        "hidden text-white transition-[width] duration-200 ease-out lg:block lg:self-start",
        collapsed ? "lg:w-[4.75rem]" : "lg:w-72",
        variant === "section" ? "" : "lg:pt-24"
      )}
      data-collapsed={collapsed}
    >
      <div
        className={cn(
          "min-w-0 rounded-[1.35rem] border border-[rgba(255,255,255,0.13)] bg-[rgba(29,29,42,0.86)] shadow-[0_16px_44px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[18px]",
          collapsed ? "p-2" : "p-4"
        )}
      >
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "justify-between")}>
          {collapsed ? null : <h2 className="type-label-sm uppercase text-white/72">Categories</h2>}
          <button
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand categories" : "Collapse categories"}
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[rgba(255,255,255,0.13)] bg-[rgba(43,43,56,0.72)] text-white/72 transition hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white"
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <nav
          aria-label="Discover categories"
          className={cn("mt-4 grid gap-1 overflow-visible", collapsed && "hidden")}
        >
          <div className="grid gap-1">
            {showAllTools ? (
              <CategoryNavLink href="/plutos-library" icon={Sparkles} isActive={!currentCategorySlug} label="All AI Tools" />
            ) : null}
            {categories.map((category) => (
              <CategoryNavLink
                href={getCategoryHref(category.slug)}
                icon={categoryIcons[category.slug] ?? Sparkles}
                isActive={category.slug === currentCategorySlug}
                key={category.id}
                label={category.name}
              />
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
function CategoryNavLink({
  href,
  icon: Icon,
  isActive,
  label
}: {
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "focus-ring flex min-h-10 items-center gap-3 rounded-lg px-3 type-label-sm text-white/68 transition hover:bg-white/[0.06] hover:text-white",
        isActive && "border border-[rgba(168,137,255,0.3)] bg-[rgba(111,82,255,0.16)] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      )}
      href={href}
    >
      <Icon aria-hidden="true" className={cn("h-4 w-4 shrink-0", isActive ? "text-violet-300" : "text-violet-300/78")} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
}