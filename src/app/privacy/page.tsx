import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell width="content">
      <PageHeader
        eyebrow="Privacy"
        eyebrowTone="neutral"
        title="Local-first public discovery."
        description="Pluto's primary journey does not require login. Recently viewed tools, saved tools and compare selections are stored on this device only."
      />
    </PageShell>
  );
}