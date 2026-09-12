import { DiscoverGuideSection } from "@/components/home/discover-guide-section";
import { HomeFaqSection } from "@/components/home/home-faq-section";
import { HomeTrendingSection } from "@/components/home/home-trending-section";
import { PlutoHero } from "@/components/home/pluto-hero";
import { PopularCategoriesShowcase } from "@/components/home/popular-categories-showcase";
import { PlutoStorySection } from "@/components/home/pluto-story-section";
import {
  ContentBlockReveal,
  SectionEyebrowReveal,
  WordReveal
} from "@/components/motion/scroll-reveals";
import { Badge } from "@/components/ui/badge";
import { SubmitToolButton } from "@/components/submissions/submit-tool-trigger";
import { getTrendingResponse } from "@/lib/trending";
import Silk from "@/components/ui/silk";

export default async function Home() {
  const initialTrending = await getTrendingResponse({ period: "week", limit: 4 });

  return (
    <main>
      <PlutoHero />
      <PlutoStorySection />
      <PopularCategoriesShowcase />
      <DiscoverGuideSection />
      <HomeTrendingSection initialResponse={initialTrending} />
      <HomeFaqSection />
      <SubmitCta />
    </main>
  );
}

function SubmitCta() {
  return (
    <section className="site-section">
      <div className="site-container">
        <div className="relative isolate grid gap-8 overflow-hidden rounded-[2rem] border border-neutral-200 bg-ink-950 p-6 text-white shadow-elevated md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div aria-hidden="true" className="absolute inset-0 z-0 opacity-80">
            <Silk
              color="#5227FF"
              noiseIntensity={1.5}
              rotation={0}
              scale={1}
              speed={5}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[linear-gradient(110deg,rgba(21,21,21,0.78),rgba(21,21,21,0.56)_48%,rgba(200,255,90,0.16))]"
          />
          <div className="relative z-20">
            <SectionEyebrowReveal>
              <Badge className="text-lime-400" tone="neutral">
                Submit a Tool
              </Badge>
            </SectionEyebrowReveal>
            <WordReveal
              as="h1"
              className="mt-4 type-h1"
              text="Built something useful? Add it to the universe."
            />
            <ContentBlockReveal as="p" className="mt-4 max-w-2xl type-body-md text-white/78" delay={0.08}>
              A guided submission flow will capture product details, pricing,
              platform support and verification notes without one long form.
            </ContentBlockReveal>
          </div>
          <SubmitToolButton className="relative z-20" showArrow size="lg" variant="primary">
            Start submission
          </SubmitToolButton>
        </div>
      </div>
    </section>
  );
}
