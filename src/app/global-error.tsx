"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0810", color: "#fff", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main style={{ margin: "0 auto", maxWidth: "48rem", padding: "8rem 1.5rem" }}>
          <p style={{ color: "#c8ff5a", fontWeight: 700 }}>Pluto Finds</p>
          <h1>Something unexpected happened.</h1>
          <p>Please retry. If the problem continues, return to the homepage in a new tab.</p>
          <button onClick={reset} style={{ minHeight: 44, padding: "0 1.25rem", cursor: "pointer" }} type="button">
            Try again
          </button>
          <p><Link href="/" style={{ color: "#c8ff5a" }}>Go to the homepage</Link></p>
        </main>
      </body>
    </html>
  );
}
