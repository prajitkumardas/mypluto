import {
  AudioLines,
  Bot,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Layers3,
  LineChart,
  PenTool,
  SearchCheck,
  Sparkles,
  WandSparkles,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Category = {
  slug: string;
  name: string;
  count: number;
  description: string;
  examples: string[];
  subcategories: string[];
  filters: string[];
  tone: string;
  accent: string;
  icon: LucideIcon;
  size: "large" | "medium" | "compact";
};

export type ToolRecord = {
  slug: string;
  rank: number;
  name: string;
  category: string;
  subcategory: string;
  tagline: string;
  description: string;
  pricing: string;
  startingPrice: string;
  freePlan: boolean;
  platforms: string[];
  api: "Available" | "Limited" | "No public API";
  bestFor: string;
  targetAudience: string[];
  skillLevel: "Beginner" | "Intermediate" | "Professional";
  features: string[];
  useCases: string[];
  integrations: string[];
  advantages: string[];
  limitations: string[];
  alternatives: string[];
  verified: string;
  verification: {
    website: boolean;
    pricing: boolean;
    features: boolean;
    status: "Verified" | "Needs review" | "Recently updated";
  };
  officialUrl: string;
  movement: string;
  trendingReason: string;
  accent: string;
  openSource: boolean;
};

export const categories: Category[] = [
  {
    slug: "creative",
    name: "Creative",
    count: 286,
    description: "Generate, edit and package visual work for campaigns and products.",
    examples: ["image generation", "video", "branding"],
    subcategories: ["Image generation", "Video generation", "Logo design", "Background removal"],
    filters: ["Commercial usage", "Batch generation", "Style control", "Output resolution"],
    tone: "bg-coral",
    accent: "#FF8269",
    icon: WandSparkles,
    size: "large"
  },
  {
    slug: "development",
    name: "Development",
    count: 194,
    description: "Coding agents, IDE assistants, documentation and QA workflows.",
    examples: ["code agents", "testing", "docs"],
    subcategories: ["Code assistant", "Testing", "Documentation", "App builders"],
    filters: ["IDE integration", "Repository access", "Debugging", "API support"],
    tone: "bg-violet-600",
    accent: "#6C4DFF",
    icon: Code2,
    size: "medium"
  },
  {
    slug: "productivity",
    name: "Productivity",
    count: 231,
    description: "Summarize, plan, present and automate everyday knowledge work.",
    examples: ["notes", "meetings", "workflows"],
    subcategories: ["Presentations", "Meetings", "Automation", "Documents"],
    filters: ["Team workspaces", "Export formats", "Calendar sync", "Browser support"],
    tone: "bg-sky",
    accent: "#78D7FF",
    icon: Workflow,
    size: "medium"
  },
  {
    slug: "writing",
    name: "Writing",
    count: 172,
    description: "Draft, edit, repurpose and localize written content.",
    examples: ["copy", "editing"],
    subcategories: ["Copywriting", "Editing", "Research writing", "Localization"],
    filters: ["Tone control", "Citations", "Long-form", "Team review"],
    tone: "bg-lavender",
    accent: "#D8D0FF",
    icon: PenTool,
    size: "compact"
  },
  {
    slug: "business",
    name: "Business",
    count: 148,
    description: "Sales, support, CRM and operational intelligence tools.",
    examples: ["sales", "CRM"],
    subcategories: ["Sales", "Customer support", "Analytics", "CRM"],
    filters: ["CRM sync", "Role permissions", "Audit logs", "Support channels"],
    tone: "bg-[#FFD36E]",
    accent: "#FFD36E",
    icon: BriefcaseBusiness,
    size: "compact"
  },
  {
    slug: "research",
    name: "Research",
    count: 93,
    description: "Explore, summarize and cite high-signal information.",
    examples: ["papers", "citations"],
    subcategories: ["Answer engines", "Paper search", "Citations", "Knowledge bases"],
    filters: ["Citation quality", "PDF support", "Export", "Source recency"],
    tone: "bg-[#55E6D4]",
    accent: "#55E6D4",
    icon: SearchCheck,
    size: "compact"
  },
  {
    slug: "audio",
    name: "Audio",
    count: 74,
    description: "Voice, transcription, music and podcast production tools.",
    examples: ["voice", "podcasts"],
    subcategories: ["Voice generation", "Transcription", "Music", "Podcast editing"],
    filters: ["Voice cloning", "Languages", "Noise cleanup", "Export quality"],
    tone: "bg-[#FFB8D7]",
    accent: "#FFB8D7",
    icon: AudioLines,
    size: "compact"
  }
];

export const tools: ToolRecord[] = [
  {
    slug: "runway",
    rank: 1,
    name: "Runway",
    category: "Creative",
    subcategory: "Video generation",
    tagline: "Fast-moving video generation suite for creators and teams.",
    description:
      "Runway helps creators generate, edit and assemble video assets from text, images and existing footage.",
    pricing: "Freemium",
    startingPrice: "$12/mo",
    freePlan: true,
    platforms: ["Web", "iOS"],
    api: "Limited",
    bestFor: "Cinematic product clips",
    targetAudience: ["Creators", "Marketing teams", "Designers"],
    skillLevel: "Intermediate",
    features: ["Image-to-video", "Text-to-video", "Storyboard tools", "Team workspaces"],
    useCases: ["Create cinematic product videos", "Social campaign clips"],
    integrations: ["Adobe export", "Cloud media"],
    advantages: ["Strong visual output", "Fast iteration", "Team-friendly review"],
    limitations: ["Advanced control can take practice", "Usage limits vary by plan"],
    alternatives: ["pika", "kaiber", "gamma"],
    verified: "Aug 2026",
    verification: { website: true, pricing: true, features: true, status: "Verified" },
    officialUrl: "https://runwayml.com",
    movement: "+4",
    trendingReason: "High comparison activity for product-photo-to-video workflows.",
    accent: "#FF8269",
    openSource: false
  },
  {
    slug: "cursor",
    rank: 2,
    name: "Cursor",
    category: "Development",
    subcategory: "Code assistant",
    tagline: "AI coding environment built for everyday engineering work.",
    description:
      "Cursor combines editor-native chat, codebase understanding and agentic coding workflows.",
    pricing: "Paid",
    startingPrice: "$20/mo",
    freePlan: true,
    platforms: ["macOS", "Windows", "Linux"],
    api: "No public API",
    bestFor: "Codebase navigation",
    targetAudience: ["Developers", "Startup teams"],
    skillLevel: "Intermediate",
    features: ["Repo-aware chat", "Inline edits", "Terminal context", "Multi-file changes"],
    useCases: ["Refactor a codebase", "Ship features faster"],
    integrations: ["VS Code ecosystem", "GitHub"],
    advantages: ["Strong developer workflow", "Useful for existing codebases"],
    limitations: ["Requires code review discipline", "Not a hosted app builder"],
    alternatives: ["github-copilot", "replit-agent"],
    verified: "Aug 2026",
    verification: { website: true, pricing: true, features: true, status: "Verified" },
    officialUrl: "https://cursor.com",
    movement: "+2",
    trendingReason: "Frequent searches for repository-aware coding assistants.",
    accent: "#6C4DFF",
    openSource: false
  },
  {
    slug: "gamma",
    rank: 3,
    name: "Gamma",
    category: "Productivity",
    subcategory: "Presentations",
    tagline: "Generate polished decks, docs and sites from structured prompts.",
    description:
      "Gamma turns outlines and prompts into presentation-style documents with quick editing and sharing.",
    pricing: "Freemium",
    startingPrice: "$10/mo",
    freePlan: true,
    platforms: ["Web"],
    api: "No public API",
    bestFor: "Pitch narratives",
    targetAudience: ["Founders", "Students", "Consultants"],
    skillLevel: "Beginner",
    features: ["Prompt-to-deck", "Theme controls", "Web publishing", "PDF export"],
    useCases: ["Create a presentation from a PDF", "Build a pitch deck"],
    integrations: ["Google Drive", "PDF export"],
    advantages: ["Very fast first draft", "Beginner-friendly", "Clean sharing"],
    limitations: ["Less flexible for custom layouts", "API access is limited"],
    alternatives: ["canva", "beautiful-ai", "framer-ai"],
    verified: "Aug 2026",
    verification: { website: true, pricing: true, features: true, status: "Verified" },
    officialUrl: "https://gamma.app",
    movement: "+7",
    trendingReason: "Search growth around PDF-to-presentation workflows.",
    accent: "#78D7FF",
    openSource: false
  },
  {
    slug: "perplexity",
    rank: 4,
    name: "Perplexity",
    category: "Research",
    subcategory: "Answer engines",
    tagline: "Answer engine with citations and broad information discovery.",
    description:
      "Perplexity provides conversational research with cited sources and follow-up exploration.",
    pricing: "Freemium",
    startingPrice: "$20/mo",
    freePlan: true,
    platforms: ["Web", "iOS", "Android"],
    api: "Available",
    bestFor: "Research summaries",
    targetAudience: ["Students", "Researchers", "Operators"],
    skillLevel: "Beginner",
    features: ["Cited answers", "Collections", "File context", "API"],
    useCases: ["Summarize research papers", "Compare sources quickly"],
    integrations: ["Browser", "Mobile apps", "API"],
    advantages: ["Transparent source links", "Fast exploratory research"],
    limitations: ["Still requires source verification", "Not a citation manager"],
    alternatives: ["consensus", "scite", "elicit"],
    verified: "Aug 2026",
    verification: { website: true, pricing: true, features: true, status: "Verified" },
    officialUrl: "https://www.perplexity.ai",
    movement: "+1",
    trendingReason: "Steady outbound clicks from research and student workflows.",
    accent: "#55E6D4",
    openSource: false
  },
  {
    slug: "remove-bg",
    rank: 5,
    name: "remove.bg",
    category: "Creative",
    subcategory: "Background removal",
    tagline: "Purpose-built background removal for images and product batches.",
    description:
      "remove.bg removes backgrounds from individual images and batch product-photo workflows.",
    pricing: "Freemium",
    startingPrice: "$9/mo",
    freePlan: true,
    platforms: ["Web", "API", "Desktop"],
    api: "Available",
    bestFor: "Bulk product images",
    targetAudience: ["Ecommerce teams", "Designers"],
    skillLevel: "Beginner",
    features: ["Background removal", "Batch processing", "API", "Commercial usage"],
    useCases: ["Remove backgrounds from 500 images", "Prepare catalog photos"],
    integrations: ["API", "Photoshop plugin", "Zapier"],
    advantages: ["Focused workflow", "Reliable batch handling", "API support"],
    limitations: ["Narrower creative scope", "Credit-based plans"],
    alternatives: ["canva", "photoroom", "clipdrop"],
    verified: "Aug 2026",
    verification: { website: true, pricing: true, features: true, status: "Verified" },
    officialUrl: "https://www.remove.bg",
    movement: "+3",
    trendingReason: "High intent searches for ecommerce image cleanup.",
    accent: "#C8FF5A",
    openSource: false
  },
  {
    slug: "canva",
    rank: 6,
    name: "Canva",
    category: "Creative",
    subcategory: "Logo design",
    tagline: "Accessible design workspace with growing AI-assisted creation tools.",
    description:
      "Canva supports brand, presentation and marketing design with templates and AI creative assists.",
    pricing: "Freemium",
    startingPrice: "$15/mo",
    freePlan: true,
    platforms: ["Web", "iOS", "Android", "Desktop"],
    api: "Limited",
    bestFor: "Brand and campaign design",
    targetAudience: ["Creators", "Small businesses", "Educators"],
    skillLevel: "Beginner",
    features: ["Templates", "Magic design", "Brand kit", "Team collaboration"],
    useCases: ["Design a professional logo", "Create marketing assets"],
    integrations: ["Google Drive", "Dropbox", "Social publishing"],
    advantages: ["Low learning curve", "Broad asset library", "Strong collaboration"],
    limitations: ["Template-heavy results need careful brand editing"],
    alternatives: ["adobe-express", "gamma", "figma"],
    verified: "Aug 2026",
    verification: { website: true, pricing: true, features: true, status: "Verified" },
    officialUrl: "https://www.canva.com",
    movement: "+2",
    trendingReason: "Strong category entry point for beginner-friendly design tasks.",
    accent: "#D8D0FF",
    openSource: false
  }
];

export const trendingTools = tools.slice(0, 4);

export const comparisonTools = tools.slice(2, 5).map((tool) => ({
  name: tool.name,
  logo: tool.name.charAt(0),
  price: tool.startingPrice,
  bestFor: tool.bestFor.toLowerCase(),
  api: tool.api,
  team: tool.targetAudience.includes("Marketing teams") ? "Strong" : "Medium",
  limitation: tool.limitations[0]
}));

export const librarySteps = [
  {
    title: "Describe your goal",
    copy: "Plain language works best. Pluto extracts the job, output and constraints.",
    icon: Sparkles
  },
  {
    title: "Set preferences",
    copy: "Budget, skill level, platform and collaboration needs shape the shortlist.",
    icon: Layers3
  },
  {
    title: "Get matched tools",
    copy: "Recommendations explain fit, tradeoffs and verification freshness.",
    icon: Bot
  }
];

export const collections = [
  {
    slug: "ai-starter-kit-for-designers",
    name: "AI starter kit for designers",
    description: "Image, UI, presentation and handoff tools for design teams."
  },
  {
    slug: "build-a-website-without-code",
    name: "Build a website without code",
    description: "Prompt-first site builders, design systems and publishing tools."
  },
  {
    slug: "student-research-toolkit",
    name: "Student research toolkit",
    description: "Research, citation, study and presentation workflows."
  },
  {
    slug: "small-business-automation-stack",
    name: "Small business automation stack",
    description: "Support, CRM, content and operations automation."
  }
];

export const professions = [
  {
    slug: "creators",
    title: "Creators",
    icon: WandSparkles,
    copy: "Visual, audio and campaign tools with commercial-use signals.",
    workflows: ["Research", "Image generation", "Video editing", "Publishing"]
  },
  {
    slug: "founders",
    title: "Founders",
    icon: LineChart,
    copy: "Launch, automate and analyze without stitching together guesswork.",
    workflows: ["Pitch decks", "Landing pages", "Sales", "Support"]
  },
  {
    slug: "students",
    title: "Students",
    icon: GraduationCap,
    copy: "Study, cite, summarize and build with transparent limitations.",
    workflows: ["Research", "Summaries", "Presentations", "Writing"]
  }
];

export const useCases = [
  {
    slug: "create-product-videos",
    title: "Create product videos",
    query: "I want to create cinematic Instagram reels from product photos.",
    groups: ["Best overall", "Best free option", "Easiest to use", "Best professional option"],
    tools: ["runway", "canva", "gamma"]
  },
  {
    slug: "remove-backgrounds",
    title: "Remove product-image backgrounds",
    query: "I need to remove backgrounds from 500 product images.",
    groups: ["Best overall", "Best for bulk processing", "Best for API usage"],
    tools: ["remove-bg", "canva"]
  },
  {
    slug: "presentation-from-pdf",
    title: "Create a presentation from a PDF",
    query: "Turn a PDF into a presentation I can edit and share.",
    groups: ["Best overall", "Best for beginners", "Best for teams"],
    tools: ["gamma", "canva", "perplexity"]
  }
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function searchTools(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return tools;
  }

  return tools.filter((tool) => {
    const haystack = [
      tool.name,
      tool.category,
      tool.subcategory,
      tool.tagline,
      tool.bestFor,
      ...tool.features,
      ...tool.useCases,
      ...tool.targetAudience
    ]
      .join(" ")
      .toLowerCase();

    return normalized
      .split(/\s+/)
      .filter(Boolean)
      .some((term) => haystack.includes(term));
  });
}
