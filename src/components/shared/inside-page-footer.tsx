import Link from "next/link";
import { Instagram, Linkedin, X } from "lucide-react";
import styles from "./inside-page-footer.module.css";

const footerLinks = [
  { label: "About", href: "/pluto" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact", href: "mailto:hello@plutofinds.com" }
] as const;

const socialIcons = [
  { label: "LinkedIn", Icon: Linkedin },
  { label: "X", Icon: X },
  { label: "Instagram", Icon: Instagram }
] as const;

export function InsidePageFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} Pluto Finds. All rights reserved.</p>

        <nav aria-label="Legal and company links" className={styles.navigation}>
          <ul>
            {footerLinks.map((link) => (
              <li key={link.href}>
                {link.href.startsWith("mailto:") ? (
                  <a href={link.href}>{link.label}</a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div aria-label="Social media" className={styles.socialList}>
          {socialIcons.map(({ label, Icon }) => (
            <span aria-label={label} className={styles.socialIcon} key={label} role="img">
              <Icon aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
