import type { ExternalTrendSignal, TrendDataProvider, TrendToolMapping, TrendWindow } from "@/lib/trending";

export class PlutoAnalyticsProvider implements TrendDataProvider {
  name = "pluto";
  enabled = true;

  async fetchSignals(): Promise<ExternalTrendSignal[]> {
    return [];
  }
}

export class ProductHuntProvider implements TrendDataProvider {
  name = "productHunt";
  enabled = Boolean(process.env.PRODUCT_HUNT_CLIENT_ID && process.env.PRODUCT_HUNT_CLIENT_SECRET);

  async fetchSignals(tools: TrendToolMapping[]): Promise<ExternalTrendSignal[]> {
    if (!this.enabled) return [];
    const mappedTools = tools.filter((tool) => tool.productHuntId);
    if (mappedTools.length === 0) return [];

    return [];
  }
}

export class GitHubProvider implements TrendDataProvider {
  name = "github";
  enabled = Boolean(process.env.GITHUB_TOKEN);

  async fetchSignals(tools: TrendToolMapping[]): Promise<ExternalTrendSignal[]> {
    if (!this.enabled) return [];
    const mappedTools = tools.filter((tool) => tool.githubOwner && tool.githubRepo);
    if (mappedTools.length === 0) return [];

    return [];
  }
}

export class GoogleTrendsProvider implements TrendDataProvider {
  name = "googleTrends";
  enabled = process.env.GOOGLE_TRENDS_ENABLED === "true";

  async fetchSignals(tools: TrendToolMapping[]): Promise<ExternalTrendSignal[]> {
    if (!this.enabled) return [];
    const mappedTools = tools.filter((tool) => tool.googleTrendsTerm);
    if (mappedTools.length === 0) return [];

    return [];
  }
}

export async function collectTrendSignals({
  providers,
  tools,
  window
}: {
  providers: TrendDataProvider[];
  tools: TrendToolMapping[];
  window: TrendWindow;
}) {
  const results = await Promise.allSettled(
    providers.filter((provider) => provider.enabled).map(async (provider) => ({
      name: provider.name,
      signals: await provider.fetchSignals(tools, window)
    }))
  );

  return {
    signals: results.flatMap((result) => (result.status === "fulfilled" ? result.value.signals : [])),
    status: Object.fromEntries(
      providers.map((provider) => [
        provider.name,
        provider.enabled && results.some((result) => result.status === "fulfilled" && result.value.name === provider.name)
      ])
    )
  };
}

export function getDefaultTrendProviders(): TrendDataProvider[] {
  return [
    new PlutoAnalyticsProvider(),
    new ProductHuntProvider(),
    new GitHubProvider(),
    new GoogleTrendsProvider()
  ];
}