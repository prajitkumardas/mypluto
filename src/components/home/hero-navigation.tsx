"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./pluto-hero.module.css";

const navItems = [
  ["Discover", "/tools"],
  ["Pluto's Library", "/plutos-library"],
  ["Trending", "/trending"],
  ["Compare", "/compare"]
];

export function HeroNavigation() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setHasScrolled(window.scrollY > 8);

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header className={cn(styles.heroHeader, hasScrolled && styles.heroHeaderScrolled)}>
      <Link className={styles.logo} href="/" aria-label="PlutoFinds home">
        <Image
          alt="PlutoFinds"
          className={styles.logoImage}
          height={120}
          priority
          src="/images/plutofinds-logo.png"
          width={450}
        />
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
