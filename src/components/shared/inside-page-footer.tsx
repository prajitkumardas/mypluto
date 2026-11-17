import Link from "next/link";
import styles from "./inside-page-footer.module.css";
import { insidePageFooterLinks, insidePageSocialIcons } from "./inside-page-footer-content";

export function InsidePageFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} Pluto Finds. All rights reserved.</p>

        <nav aria-label="Legal and company links" className={styles.navigation}>
          <ul>
            {insidePageFooterLinks.map((link) => (
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
          {insidePageSocialIcons.map(({ label, Icon }) => (
            <span aria-label={label} className={styles.socialIcon} key={label} role="img">
              <Icon aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
