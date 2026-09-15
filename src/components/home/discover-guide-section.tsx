"use client";

import { Clock3, Sparkles, Zap } from "lucide-react";
import { PlutoButton } from "@/components/ui/pluto-button";
import { ScrollExpand } from "./scroll-expand";
import styles from "./discover-guide-section.module.css";

const DISCOVER_IMAGE_SRC = "/images/home/home-discover-bg.png";

const guideHighlights = [
  {
    icon: Zap,
    label: "4 quick questions"
  },
  {
    icon: Sparkles,
    label: "Personalized matches"
  },
  {
    icon: Clock3,
    label: "Takes about a minute"
  }
];

export function DiscoverGuideSection() {
  return (
    <section aria-labelledby="discover-guide-title" className={styles.section} id="library">
      <ScrollExpand
        alt="Pluto watching a sunset from a city window"
        className={styles.scrollExpand}
        endRadius={0}
        holdDistance={0.38}
        mediaZoom={1.22}
        overlayScrim={0.58}
        scrollDistance={1.18}
        smoothing={0.11}
        src={DISCOVER_IMAGE_SRC}
        startHeight={56}
        startRadius={28}
        startWidth={44}
        useWindowScroll
      >
        <div aria-hidden="true" className={styles.textVeil} />
        <div className={styles.content}>
          <p className={styles.eyebrow}>Pluto Guides</p>
          <h1 className={styles.title} id="discover-guide-title">
            Not sure where <span>to start?</span>
          </h1>
          <p className={styles.copy}>
            Tell Pluto what you need, and get AI tools matched to your workflow.
          </p>

          <ul aria-label="How the guide works" className={styles.highlights}>
            {guideHighlights.map(({ icon: Icon, label }) => (
              <li className={styles.highlight} key={label}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <PlutoButton className={styles.action} href="/pluto-guides" showArrow size="lg" variant="secondary">
              <Sparkles aria-hidden="true" className={styles.buttonIcon} />
              Start Guide
            </PlutoButton>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}
