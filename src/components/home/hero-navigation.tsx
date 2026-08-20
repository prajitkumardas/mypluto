"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./pluto-hero.module.css";

const navItems = [
  ["Discover", "/tools"],
  ["Pluto's Library", "/plutos-library"],
  ["Trending", "/trending"],
  ["Compare", "/compare"],
  ["About", "/verification"]
];

export function HeroNavigation() {
  return (
    <header className={styles.heroHeader}>
      <Link className={styles.logo} href="/" aria-label="PlutoFinds home">
        <span className={styles.logoMark} aria-hidden="true" />
        <span className={styles.logoText}>
          Pluto<span>Finds</span>
        </span>
      </Link>

      <nav aria-label="Primary" className={styles.desktopNav}>
        {navItems.map(([label, href]) => (
          <Link className={styles.heroNavLink} href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.headerActions}>
        <button className={styles.languageButton} type="button" aria-label="Language selection">
          Eng <ChevronDown aria-hidden="true" />
        </button>
        <Link className={styles.submitButton} href="/submit-tool">
          Submit a Tool
        </Link>
        <MobileMenu />
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className={styles.menuButton} size="icon" variant="secondary" aria-label="Open menu">
          <Menu aria-hidden="true" className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.mobileOverlay} />
        <Dialog.Content className={styles.mobilePanel}>
          <div className={styles.mobilePanelHeader}>
            <Dialog.Title className={styles.mobileTitle}>PlutoFinds</Dialog.Title>
            <Dialog.Close asChild>
              <Button aria-label="Close menu" size="icon" variant="ghost">
                <X aria-hidden="true" className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile primary" className={styles.mobileNav}>
            {navItems.map(([label, href]) => (
              <Dialog.Close asChild key={href}>
                <Link className={styles.mobileNavLink} href={href}>
                  {label}
                </Link>
              </Dialog.Close>
            ))}
            <Dialog.Close asChild>
              <Link className={styles.mobileSubmitLink} href="/submit-tool">
                Submit a Tool
              </Link>
            </Dialog.Close>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
