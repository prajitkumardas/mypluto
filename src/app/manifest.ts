import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pluto Finds",
    short_name: "Pluto",
    description: "Discover, compare, and understand trustworthy AI tools.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#0a0810",
    theme_color: "#0a0810",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "Discover tools", short_name: "Discover", url: "/plutos-library?source=pwa-shortcut" },
      { name: "Compare tools", short_name: "Compare", url: "/compare?source=pwa-shortcut" },
      { name: "Play with Pluto", short_name: "Play", url: "/play?source=pwa-shortcut" }
    ]
  };
}
