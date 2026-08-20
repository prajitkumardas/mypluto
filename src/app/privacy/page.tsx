import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="neutral">Privacy</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        Local-first public discovery.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Pluto&apos;s primary journey does not require login. Recently viewed tools,
        saved tools and compare selections are stored on this device only.
      </p>
    </main>
  );
}
