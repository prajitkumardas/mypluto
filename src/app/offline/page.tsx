import Link from "next/link";
import { CloudOff, Gamepad2, GitCompareArrows } from "lucide-react";

export const metadata = { title: "You are offline | Pluto Finds", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <main className="pwa-offline-page">
      <section aria-labelledby="offline-title" className="pwa-offline-card">
        <span aria-hidden="true" className="pwa-offline-icon"><CloudOff /></span>
        <p className="type-overline text-lime-300">Pluto is still here</p>
        <h1 className="type-h1" id="offline-title">You&apos;re offline.</h1>
        <p className="type-body-md">Reconnect to load fresh tool data. Pages you opened earlier may still be available.</p>
        <div className="pwa-offline-actions">
          <Link className="pwa-shell-button pwa-shell-button-primary" href="/"><span aria-hidden="true">↻</span> Try home</Link>
          <Link className="pwa-shell-button" href="/compare"><GitCompareArrows aria-hidden="true" /> Compare</Link>
          <Link className="pwa-shell-button" href="/play"><Gamepad2 aria-hidden="true" /> Play</Link>
        </div>
      </section>
    </main>
  );
}
