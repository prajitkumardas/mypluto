export type GuideOption = {
  id: string;
  label: string;
  description: string;
  terms: string[];
};

export type GuideGoal = GuideOption & {
  tasks: GuideOption[];
};

export type GuideAnswers = {
  goal: string;
  primaryTask: string;
  relatedTasks: string[];
  preferences: string[];
  budget: string;
  platform: string;
  requirements: string[];
};

export type GuideRecommendation = {
  slug: string;
  name: string;
  officialUrl: string;
  href: string;
  shortDescription: string;
  categories: string[];
  features: string[];
  platforms: string[];
  pricing: string;
  api: string;
  verification: string;
  score: number;
  fit: string;
  useCase: string;
  reasons: string[];
  matchedRequirements: string[];
};

export const guideGoals: GuideGoal[] = [
  {
    id: "create-content",
    label: "Create content or media",
    description: "Writing, images, video, audio, presentations, and brand assets.",
    terms: ["content", "writing", "image", "video", "audio", "design", "presentation", "creative"],
    tasks: [
      {
        id: "write-copy",
        label: "Write or edit copy",
        description: "Draft articles, ads, emails, scripts, and social posts.",
        terms: ["writing", "copywriting", "article", "blog", "email", "script", "social", "content"]
      },
      {
        id: "generate-images",
        label: "Generate or edit images",
        description: "Create visuals, product shots, illustrations, and design assets.",
        terms: ["image", "photo", "design", "illustration", "graphics", "product shot", "visual"]
      },
      {
        id: "generate-videos",
        label: "Create or edit video",
        description: "Produce clips, ads, explainers, avatars, and video edits.",
        terms: ["video", "avatar", "clip", "editing", "animation", "cinematic", "ad"]
      },
      {
        id: "make-presentations",
        label: "Build presentations",
        description: "Turn ideas, docs, or outlines into polished slides.",
        terms: ["presentation", "slides", "pitch", "deck", "storytelling"]
      }
    ]
  },
  {
    id: "automate-work",
    label: "Automate work",
    description: "Support, meetings, admin work, sales workflows, and operations.",
    terms: ["automation", "workflow", "support", "meeting", "sales", "operations", "admin"],
    tasks: [
      {
        id: "customer-support",
        label: "Handle customer support",
        description: "Answer questions, triage tickets, and draft support replies.",
        terms: ["customer", "support", "chatbot", "ticket", "helpdesk", "service"]
      },
      {
        id: "meeting-notes",
        label: "Capture meetings",
        description: "Record, summarize, transcribe, and extract action items.",
        terms: ["meeting", "transcription", "notes", "summary", "recording", "action items"]
      },
      {
        id: "sales-outreach",
        label: "Improve sales outreach",
        description: "Research leads, personalize outbound, and manage follow-up.",
        terms: ["sales", "outreach", "lead", "crm", "prospecting", "email"]
      },
      {
        id: "document-workflows",
        label: "Automate documents",
        description: "Extract, classify, summarize, and route documents.",
        terms: ["document", "pdf", "extraction", "classification", "workflow", "ocr"]
      }
    ]
  },
  {
    id: "research-learn",
    label: "Research or learn",
    description: "Summaries, academic research, market discovery, and learning support.",
    terms: ["research", "summarize", "knowledge", "learning", "analysis", "market"],
    tasks: [
      {
        id: "summarize-documents",
        label: "Summarize documents",
        description: "Condense PDFs, notes, webpages, reports, and long documents.",
        terms: ["summarize", "summary", "document", "pdf", "report", "webpage"]
      },
      {
        id: "academic-research",
        label: "Research papers",
        description: "Find, map, read, and understand scientific literature.",
        terms: ["academic", "paper", "literature", "citation", "science", "research"]
      },
      {
        id: "market-research",
        label: "Research a market",
        description: "Analyze companies, users, competitors, and industry trends.",
        terms: ["market", "competitor", "industry", "company", "trend", "analysis"]
      },
      {
        id: "study-faster",
        label: "Study faster",
        description: "Tutor, explain, quiz, and personalize learning.",
        terms: ["learning", "study", "tutor", "quiz", "education", "explain"]
      }
    ]
  },
  {
    id: "build-products",
    label: "Build products",
    description: "Coding, no-code apps, prototypes, websites, data, and product design.",
    terms: ["code", "app", "prototype", "website", "data", "developer", "design"],
    tasks: [
      {
        id: "code-assistant",
        label: "Code faster",
        description: "Generate, debug, review, and explain code.",
        terms: ["code", "developer", "debug", "programming", "software", "review"]
      },
      {
        id: "no-code-app",
        label: "Build without coding",
        description: "Create apps, automations, dashboards, and internal tools.",
        terms: ["no-code", "app", "builder", "dashboard", "internal tool", "automation"]
      },
      {
        id: "prototype-design",
        label: "Prototype product design",
        description: "Explore UX, wireframes, mockups, and interface ideas.",
        terms: ["prototype", "ux", "ui", "wireframe", "mockup", "design"]
      },
      {
        id: "analyze-data",
        label: "Analyze data",
        description: "Clean, visualize, query, and interpret datasets.",
        terms: ["data", "analytics", "spreadsheet", "visualization", "sql", "analysis"]
      }
    ]
  },
  {
    id: "run-business",
    label: "Run a business",
    description: "Marketing, SEO, legal, finance, HR, and team operations.",
    terms: ["business", "marketing", "seo", "legal", "finance", "hr", "operations"],
    tasks: [
      {
        id: "marketing-seo",
        label: "Grow marketing or SEO",
        description: "Plan campaigns, improve SEO, and create growth assets.",
        terms: ["marketing", "seo", "campaign", "growth", "keyword", "content"]
      },
      {
        id: "legal-review",
        label: "Review legal work",
        description: "Draft, review, research, and compare legal documents.",
        terms: ["legal", "contract", "law", "compliance", "document", "review"]
      },
      {
        id: "finance-ops",
        label: "Improve finance operations",
        description: "Forecast, reconcile, report, and analyze business finances.",
        terms: ["finance", "accounting", "forecast", "report", "invoice", "reconcile"]
      },
      {
        id: "people-ops",
        label: "Support HR or recruiting",
        description: "Screen candidates, write job posts, and support employees.",
        terms: ["hr", "recruiting", "candidate", "employee", "resume", "hiring"]
      }
    ]
  }
];

export const guidePreferences: GuideOption[] = [
  {
    id: "best-output-quality",
    label: "Best output quality",
    description: "Prioritize stronger generation, analysis, or final polish.",
    terms: ["quality", "professional", "advanced", "best", "polished"]
  },
  {
    id: "easy-to-use",
    label: "Easy to use",
    description: "Prefer simple onboarding and approachable workflows.",
    terms: ["easy", "simple", "user-friendly", "template", "assistant"]
  },
  {
    id: "fast-setup",
    label: "Fast setup",
    description: "Get useful results quickly with minimal configuration.",
    terms: ["fast", "quick", "instant", "workflow", "template"]
  },
  {
    id: "team-collaboration",
    label: "Team collaboration",
    description: "Workspaces, shared projects, comments, and approvals.",
    terms: ["team", "collaboration", "workspace", "shared", "approval"]
  },
  {
    id: "privacy-security",
    label: "Privacy and security",
    description: "Prefer security, compliance, and controlled access.",
    terms: ["privacy", "security", "compliance", "enterprise", "permission"]
  },
  {
    id: "developer-friendly",
    label: "Developer friendly",
    description: "API access, integrations, and technical flexibility.",
    terms: ["api", "developer", "integration", "sdk", "automation"]
  },
  {
    id: "no-strong-preference",
    label: "No strong preference",
    description: "Let Pluto balance the recommendations.",
    terms: []
  }
];

export const guideBudgets: GuideOption[] = [
  {
    id: "free-only",
    label: "Free or freemium only",
    description: "Only show tools with a free path where the data supports it.",
    terms: ["free", "freemium"]
  },
  {
    id: "under-20",
    label: "Under $20 per month",
    description: "Prefer accessible pricing and free trials when available.",
    terms: ["free", "freemium", "trial", "$", "month"]
  },
  {
    id: "flexible",
    label: "Flexible budget",
    description: "Balance capability and fit over price.",
    terms: ["pro", "paid", "premium", "business"]
  },
  {
    id: "business-enterprise",
    label: "Business or enterprise",
    description: "Prioritize team, security, support, and scale.",
    terms: ["enterprise", "business", "team", "security", "compliance"]
  }
];

export const guidePlatforms: GuideOption[] = [
  { id: "", label: "No platform preference", description: "Any suitable platform is fine.", terms: [] },
  { id: "web", label: "Web app", description: "Browser-first tools and SaaS products.", terms: ["web", "browser", "cloud", "saas"] },
  { id: "mobile", label: "Mobile app", description: "iOS, Android, or mobile-friendly use.", terms: ["mobile", "ios", "android"] },
  { id: "desktop", label: "Desktop app", description: "Mac, Windows, Linux, or installed apps.", terms: ["desktop", "mac", "windows", "linux"] },
  { id: "browser-extension", label: "Browser extension", description: "Chrome or browser extension workflows.", terms: ["extension", "chrome", "browser"] },
  { id: "api", label: "API", description: "Programmatic access or developer integration.", terms: ["api", "developer", "integration"] }
];

export const guideRequirements: GuideOption[] = [
  { id: "api-required", label: "API required", description: "Must support API or developer access.", terms: ["api", "developer", "integration"] },
  { id: "team-workspace", label: "Team workspace", description: "Shared workspace, collaboration, or admin features.", terms: ["team", "workspace", "collaboration", "admin"] },
  { id: "commercial-use", label: "Commercial use", description: "Suitable for professional or business use.", terms: ["business", "commercial", "professional", "enterprise"] },
  { id: "templates", label: "Templates", description: "Reusable prompts, workflows, layouts, or presets.", terms: ["template", "preset", "workflow"] },
  { id: "exports", label: "Export options", description: "Download, export, publish, or share outputs.", terms: ["export", "download", "publish", "share"] },
  { id: "multilingual", label: "Multilingual", description: "Works across languages or translation workflows.", terms: ["language", "translation", "multilingual"] },
  { id: "enterprise-security", label: "Enterprise security", description: "Security, privacy, compliance, or SSO needs.", terms: ["security", "privacy", "compliance", "sso", "enterprise"] }
];

export const emptyGuideAnswers: GuideAnswers = {
  goal: "",
  primaryTask: "",
  relatedTasks: [],
  preferences: [],
  budget: "",
  platform: "",
  requirements: []
};
