import type { MetadataRoute } from "next";

const heroName = process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth";
const heroTitle = process.env.NEXT_PUBLIC_HERO_TITLE ?? "Backend Developer";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${heroName} — ${heroTitle}`,
    short_name: heroName,
    description: `Personal portfolio of ${heroName}, ${heroTitle}`,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
