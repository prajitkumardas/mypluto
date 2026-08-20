import { CirclePlay, Code2, Image as ImageIcon, PenLine } from "lucide-react";
import Image from "next/image";
import { CategoryShortcut } from "./category-shortcut";
import { HeroNavigation } from "./hero-navigation";
import { HeroSearch } from "./hero-search";
import { InteractivePluto } from "./interactive-pluto";
import styles from "./pluto-hero.module.css";

const shortcuts = [
  {
    label: "Image",
    href: "/plutos-library/ai-image-generation-and-design",
    icon: ImageIcon,
    className: styles.shortcutImage
  },
  {
    label: "Writing",
    href: "/plutos-library/ai-writing-and-content",
    icon: PenLine,
    className: styles.shortcutWriting
  },
  {
    label: "Video",
    href: "/plutos-library/ai-video",
    icon: CirclePlay,
    className: styles.shortcutVideo
  },
  {
    label: "Code",
    href: "/plutos-library/ai-coding-and-development",
    icon: Code2,
    className: styles.shortcutCode
  }
];

export function PlutoHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <Image
        alt=""
        className={styles.backgroundImage}
        fill
        priority
        sizes="100vw"
        src="/images/home/hero/pluto-valley-background.webp"
      />
      <div className={styles.skyWash} aria-hidden="true" />
      <div className={styles.cloudsFar} aria-hidden="true" />
      <div className={styles.cloudsNear} aria-hidden="true" />
      <div className={styles.rainbowShimmer} aria-hidden="true" />
      <div className={styles.windLayerBack} aria-hidden="true" />
      <div className={styles.windLayerFront} aria-hidden="true" />

      <div className={styles.heroInner}>
        <HeroNavigation />

        <div className={styles.heroCopy}>
          <div className={styles.trustLine}>
            <span className={styles.avatarStack} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>700+ AI tools • Updated weekly</span>
          </div>

          <h1 className={styles.headline} id="home-hero-title">
            Find your perfect <span>AI tool.</span>
          </h1>
          <p className={styles.subhead}>Tell Pluto what you want to do.</p>
          <HeroSearch />
        </div>

        <div className={styles.plutoStage}>
          {shortcuts.map((shortcut) => (
            <CategoryShortcut
              className={shortcut.className}
              href={shortcut.href}
              icon={shortcut.icon}
              key={shortcut.label}
              label={shortcut.label}
            />
          ))}
          <InteractivePluto />
        </div>
      </div>
    </section>
  );
}
