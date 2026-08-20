"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Clock3,
  FolderSearch,
  Search,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const suggestions = [
  "Create cinematic product videos",
  "Summarize research papers",
  "Build an app without coding",
  "Automate customer support"
];

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-8 z-50 w-[calc(100%-32px)] max-w-4xl -translate-x-1/2 rounded-3xl border border-white/16 bg-white p-4 shadow-overlay focus:outline-none sm:top-14 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <Dialog.Title className="font-heading text-2xl font-bold text-neutral-900">
              Search the AI universe
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button aria-label="Close search" size="icon" variant="ghost">
                <X aria-hidden="true" className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>

          <label className="mt-5 flex min-h-16 items-center gap-3 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 focus-within:border-violet-600 focus-within:ring-4 focus-within:ring-violet-100">
            <Search aria-hidden="true" className="h-5 w-5 text-neutral-500" />
            <span className="sr-only">Search tools, categories and use cases</span>
            <input
              autoFocus
              className="w-full bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500 sm:text-lg"
              placeholder="What are you trying to create, solve or automate?"
            />
            <kbd className="hidden rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-500 sm:inline-flex">
              esc
            </kbd>
          </label>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <Sparkles aria-hidden="true" className="h-4 w-4 text-violet-600" />
                Popular searches
              </h3>
              <div className="mt-3 grid gap-2">
                {suggestions.map((suggestion) => (
                  <Link
                    className="focus-ring flex min-h-11 items-center justify-between rounded-xl bg-white px-3 text-left text-sm font-medium text-neutral-700 transition hover:text-violet-600"
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    key={suggestion}
                    onClick={() => onOpenChange(false)}
                  >
                    {suggestion}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                ))}
              </div>
              <Button asChild className="mt-4" variant="lime">
                <Link href="/pluto/ask" onClick={() => onOpenChange(false)}>
                  Ask Pluto <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
            </section>

            <section className="rounded-2xl bg-ink-950 p-4 text-white">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit aria-hidden="true" className="h-4 w-4 text-lime-400" />
                Ask Pluto instead
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Turn a messy goal into ranked recommendations with tradeoffs and
                verification context.
              </p>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2">
                  <FolderSearch aria-hidden="true" className="h-4 w-4 text-lime-400" />
                  Tools, categories and collections
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2">
                  <Clock3 aria-hidden="true" className="h-4 w-4 text-lime-400" />
                  Recent searches and viewed tools
                </div>
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
