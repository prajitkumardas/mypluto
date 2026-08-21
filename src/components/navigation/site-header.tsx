"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  Menu,
  Search,
  Send,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/lib/compare-store";
import { categories, professions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./search-overlay";

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const compareCount = useCompareStore((state) => state.selected.length);

  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/95 text-white backdrop-blur">
        <div className="mx-auto flex h-20 max-w-site items-center gap-4 px-5 sm:px-8 xl:px-0">
          <Link
            aria-label="PlutoFinds home"
            className="focus-ring flex items-center rounded-xl bg-white px-2 py-1 shadow-sm"
            href="/"
          >
            <Image
              alt="PlutoFinds"
              className="h-auto w-[150px] sm:w-[180px]"
              height={120}
              priority
              src="/images/plutofinds-logo.png"
              width={450}
            />
          </Link>

          <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setDiscoverOpen(true)}
              onMouseLeave={() => setDiscoverOpen(false)}
            >
              <button
                aria-expanded={discoverOpen}
                className="focus-ring flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium text-white/84 transition hover:bg-white/8 hover:text-white"
                onClick={() => setDiscoverOpen((value) => !value)}
              >
                Discover <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </button>
              <DiscoverMegaMenu open={discoverOpen} />
            </div>
            <Link className="nav-link" href="/plutos-library">
              Pluto&apos;s Library
            </Link>
            <Link className="nav-link" href="/trending">
              Trending
            </Link>
            <Link className="nav-link" href="/compare">
              Compare{" "}
              {compareCount > 0 ? (
                <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs">
                  {compareCount}
                </span>
              ) : null}
            </Link>
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button
              className="text-white/88 hover:bg-white/8 hover:text-white"
              onClick={() => setSearchOpen(true)}
              variant="ghost"
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              Search
            </Button>
            <Button asChild variant="outline">
              <Link href="/submit-tool">
                <Send aria-hidden="true" className="h-4 w-4" />
                Submit a Tool
              </Link>
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <Button
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              size="icon"
              variant="outline"
            >
              <Search aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button
              aria-label="Open menu"
              onClick={() => setMenuOpen((value) => !value)}
              size="icon"
              variant="outline"
            >
              {menuOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 bg-ink-900 px-5 py-4 md:hidden">
            <div className="grid gap-2">
              {[
                ["Discover", "/tools"],
                ["Pluto's Library", "/plutos-library"],
                ["Trending", "/trending"],
                [`Compare${compareCount ? ` (${compareCount})` : ""}`, "/compare"],
                ["Submit a Tool", "/submit-tool"]
              ].map(([item, href]) => (
                <Link
                  className="focus-ring flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-semibold text-white/86 hover:bg-white/8"
                  href={href}
                  key={item}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <SearchOverlay onOpenChange={setSearchOpen} open={searchOpen} />
    </>
  );
}

function DiscoverMegaMenu({ open }: { open: boolean }) {
  return (
    <div
      className={cn(
        "absolute left-0 top-full w-[980px] pt-3 transition",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
      )}
    >
      <div className="grid grid-cols-[1fr_1fr_0.9fr] gap-5 rounded-3xl border border-white/12 bg-white p-5 text-neutral-900 shadow-overlay">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            Browse
          </p>
          <div className="mt-3 grid gap-2">
            {categories.slice(0, 5).map((category) => (
              <Link
                className="focus-ring flex items-center gap-3 rounded-2xl p-3 transition hover:bg-neutral-50"
                href={`/categories/${category.slug}`}
                key={category.name}
              >
                <span className={cn("grid h-10 w-10 place-items-center rounded-xl", category.tone)}>
                  <category.icon aria-hidden="true" className="h-5 w-5 text-ink-950" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-neutral-500">
                    {category.examples.join(", ")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["All AI Tools", "/tools"],
              ["Use Cases", "/use-cases"],
              ["Professions", "/for/creators"],
              ["Free AI Tools", "/tools?pricing=free"]
            ].map(([label, href]) => (
              <Link
                className="focus-ring rounded-xl bg-neutral-50 px-3 py-2 text-sm font-semibold hover:text-violet-600"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            By profession
          </p>
          <div className="mt-3 grid gap-2">
            {professions.map((item) => (
              <Link
                className="focus-ring rounded-2xl border border-neutral-200 p-4 transition hover:border-violet-500"
                href={`/for/${item.slug}`}
                key={item.title}
              >
                <item.icon aria-hidden="true" className="h-5 w-5 text-violet-600" />
                <span className="mt-2 block text-sm font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-neutral-500">
                  {item.copy}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-ink-950 p-5 text-white orbit-grid">
          <Compass aria-hidden="true" className="h-8 w-8 text-lime-400" />
          <p className="mt-5 font-heading text-2xl font-bold">
            Not sure what you need?
          </p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Tell Pluto what you&apos;re trying to accomplish and get matched tools
            with reasons.
          </p>
          <Button asChild className="mt-5" variant="lime">
            <Link href="/pluto/ask">
              Ask Pluto <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
