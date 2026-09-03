import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import styles from "./site-footer.module.css";

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
  { label: "X", Icon: Twitter },
  { label: "Instagram", Icon: Instagram }
];

const contactEmail = "hello@plutofinds.com";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer navigation" className={styles.panel}>
        <div aria-hidden="true" className={styles.glow} />
        <div className={styles.grid}>
          {footerGroups.map((group) => (
            <section aria-labelledby={`footer-${group.label.toLowerCase().replace(/\s+/g, "-")}`} className={styles.group} key={group.label}>
              <h2 className={styles.groupLabel} id={`footer-${group.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {group.label}
              </h2>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={`${group.label}-${link.href}`}>
                    <Link className={styles.footerLink} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-labelledby="footer-connect" className={styles.group}>
            <h2 className={styles.groupLabel} id="footer-connect">Connect</h2>
            <a className={styles.emailLink} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            <p className={styles.contactCopy}>Questions, partnerships or tool submissions.</p>
          </section>
        </div>
      </nav>

      <div className={styles.bottomBar}>
        <Link aria-label="Pluto Finds home" className={styles.brand} href="/">
          <Image
            alt="Pluto Finds"
            className={styles.logoImage}
            height={114}
            src="/images/plutofinds-footer-logo.png"
            width={464}
          />
        </Link>

        <div className={styles.bottomMeta}>
          <p className={styles.copyright}>&copy; {currentYear} Pluto Finds. All rights reserved.</p>
          <div aria-label="Social media" className={styles.socialList}>
            {socialIcons.map(({ label, Icon }) => (
              <span aria-label={label} className={styles.socialIcon} key={label} role="img">
                <Icon aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

