export type HeroSearchResult = {
  id: string;
  slug: string;
  name: string;
  href: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  pricingLabel: string;
  logoUrl: string | null;
  score: number;
};

export type HeroSearchResponse = {
  results: HeroSearchResult[];
  source: "supabase" | "local";
};
