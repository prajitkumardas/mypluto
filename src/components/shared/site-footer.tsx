import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, X } from "lucide-react";
import type { CSSProperties } from "react";
import styles from "./site-footer.module.css";
import { SubmitToolLink } from "@/components/submissions/submit-tool-trigger";
import { FooterWordmark } from "./footer-wordmark";

type FooterLink = {
  label: string;
  href: string;
};

type FooterGroup = {
  label: string;
  links: FooterLink[];
};

type SocialIcon = {
  label: string;
  Icon: typeof Linkedin;
};

const footerGroups: FooterGroup[] = [
  {
    label: "Discover",
    links: [
      { label: "AI Tools", href: "/plutos-library" },
      { label: "Categories", href: "/categories" },
      { label: "Trending", href: "/trending" }
    ]
  },
  {
    label: "Explore",
    links: [
      { label: "Pluto Guides", href: "/pluto-guides" },
      { label: "Compare Tools", href: "/compare" },
      { label: "Play with Pluto", href: "/play" }
    ]
  },
  {
    label: "Pluto Finds",
    links: [
      { label: "About Pluto", href: "/pluto" },
      { label: "Submit a Tool", href: "/submit-tool" },
      { label: "Verification", href: "/verification" },
      { label: "Privacy", href: "/privacy" }
    ]
  }
];

const socialIcons: SocialIcon[] = [
  { label: "LinkedIn", Icon: Linkedin },
  { label: "X", Icon: X },
  { label: "Instagram", Icon: Instagram }
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Disclosures", href: "/disclosures" }
] as const;

const contactEmail = "hello@plutofinds.com";

type DustStyle = CSSProperties & {
  "--dust-delay": string;
  "--dust-drift": string;
  "--dust-duration": string;
  "--dust-opacity": string;
  "--dust-rise": string;
  "--dust-size": string;
  "--dust-x": string;
  "--dust-y": string;
};

const footerDust: Array<{ id: number; style: DustStyle }> = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  style: {
    "--dust-delay": `${-(dustValue(index, 17, 0, 80) / 10).toFixed(1)}s`,
    "--dust-drift": `${dustValue(index, 23, -22, 22).toFixed(0)}px`,
    "--dust-duration": `${dustValue(index, 29, 5.5, 9.5).toFixed(1)}s`,
    "--dust-opacity": dustValue(index, 31, 0.14, 0.34).toFixed(2),
    "--dust-rise": `${dustValue(index, 37, -128, -72).toFixed(0)}px`,
    "--dust-size": `${dustValue(index, 41, 1, 2.8).toFixed(1)}px`,
    "--dust-x": `${dustValue(index, 43, 3, 97).toFixed(1)}%`,
    "--dust-y": `${dustValue(index, 47, 58, 94).toFixed(1)}%`
  }
}));

function dustValue(index: number, salt: number, minimum: number, maximum: number) {
  const value = (Math.imul(index + 3, salt * 7919) ^ Math.imul(index + salt, 104729)) >>> 0;
  return minimum + (maximum - minimum) * ((value % 1000) / 999);
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div aria-hidden="true" className={styles.ambientGlow} />
      <div className={styles.inner}>
        <div className={styles.grid}>
          <section className={styles.brandColumn}>
            <Link aria-label="Pluto Finds home" className={styles.brand} href="/">
              <Image alt="Pluto Finds" className={styles.logoImage} height={114} src="/images/plutofinds-footer-logo.png" width={464} />
            </Link>
            <p className={styles.brandCopy}>Discover the best AI tools, handpicked for creators, builders, and curious minds.</p>
          </section>

          <nav aria-label="Footer navigation" className={styles.navigation}>
          {footerGroups.map((group) => (
            <section aria-labelledby={`footer-${group.label.toLowerCase().replace(/\s+/g, "-")}`} className={styles.group} key={group.label}>
              <p className={styles.groupLabel} id={`footer-${group.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {group.label}
              </p>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={`${group.label}-${link.href}`}>
                    {link.href === "/submit-tool" ? (
                      <SubmitToolLink className={styles.footerLink}>{link.label}</SubmitToolLink>
                    ) : (
                      <Link className={styles.footerLink} href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-labelledby="footer-connect" className={styles.group}>
            <p className={styles.groupLabel} id="footer-connect">Connect</p>
            <a className={styles.emailLink} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            <p className={styles.contactCopy}>Questions, partnerships or tool submissions.</p>
            <div aria-label="Social media" className={styles.socialList}>
              {socialIcons.map(({ label, Icon }) => (
                <span aria-label={label} className={styles.socialIcon} key={label} role="img"><Icon aria-hidden="true" /></span>
              ))}
            </div>
          </section>
          </nav>
        </div>

        <div className={styles.wordmarkStage} data-footer-wordmark-stage="true">
          <div aria-hidden="true" className={styles.dustLayer} data-footer-dust="true">
            {footerDust.map((particle) => <span key={particle.id} style={particle.style} />)}
          </div>
          <FooterWordmark />
          <div className={styles.bottomMeta}>
            <p className={styles.copyright}>&copy; {currentYear} Pluto Finds. All rights reserved.</p>
            <nav aria-label="Legal links" className={styles.legalLinks}>
              {legalLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

