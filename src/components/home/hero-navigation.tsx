"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { primaryRoutes } from "@/components/navigation/primary-routes";
import { SubmitToolButton, SubmitToolLink } from "@/components/submissions/submit-tool-trigger";
import styles from "./pluto-hero.module.css";

type HeroNavigationProps = {
  onSearchClick: () => void;
};

export function HeroNavigation({ onSearchClick }: HeroNavigationProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setHasScrolled(window.scrollY > 8);

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header className={cn(styles.heroHeader, hasScrolled && styles.heroHeaderScrolled)}>
      <Link className={styles.logo} data-scroll-top="true" href="/" aria-label="PlutoFinds home">
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
        {primaryRoutes.map(({ href, longLabel: label }) => (
          <Link className={styles.heroNavLink} href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.headerActions}>
        <button className={styles.navSearchButton} type="button" onClick={onSearchClick} aria-label="Jump to AI tool search">
          <Search aria-hidden="true" />
        </button>
        <SubmitToolButton size="md" variant="primary">
          Submit a Tool
        </SubmitToolButton>
        <MobileMenu onSearchClick={onSearchClick} />
      </div>
    </header>
  );
}

function MobileMenu({ onSearchClick }: HeroNavigationProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className={styles.menuButton} size="icon" variant="ghost" aria-label="Open menu">
          <Menu aria-hidden="true" className="h-6 w-6" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.mobileOverlay} />
        <Dialog.Content className={styles.mobilePanel}>
          <div className={styles.mobilePanelHeader}>
            <Dialog.Title className={styles.mobileTitle}>PlutoFinds</Dialog.Title>
            <Dialog.Close asChild>
              <Button aria-label="Close menu" className={styles.mobileIconButton} size="icon" variant="ghost">
                <X aria-hidden="true" className="h-6 w-6" />
              </Button>
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile primary" className={styles.mobileNav}>
            {primaryRoutes.map(({ href, longLabel: label }) => (
              <Dialog.Close asChild key={href}>
                <Link className={styles.mobileNavLink} href={href}>
                  {label}
                </Link>
              </Dialog.Close>
            ))}
            <Dialog.Close asChild>
              <button className={styles.mobileNavLink} type="button" onClick={onSearchClick}>
                Search Tools
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <SubmitToolLink className={styles.mobileSubmitLink}>
                Submit a Tool
              </SubmitToolLink>
            </Dialog.Close>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}




