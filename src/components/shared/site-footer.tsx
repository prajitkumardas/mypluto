import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink-950 py-10 text-white">
      <div className="mx-auto grid max-w-site gap-6 px-5 type-body-sm text-white/64 sm:px-8 md:grid-cols-[1fr_auto] md:items-center xl:px-0">
        <div>
          <p className="type-h6 text-white">Pluto</p>
          <p className="mt-2">Need, discover, evaluate, compare, decide, explore.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          {[
            ["Discover", "/plutos-library"],
            ["Pluto Guides", "/pluto-guides"],
            ["Trending", "/trending"],
            ["Compare", "/compare"],
            ["Verification", "/verification"],
            ["Privacy", "/privacy"]
          ].map(([label, href]) => (
            <Link className="focus-ring rounded-lg hover:text-lime-400" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}


