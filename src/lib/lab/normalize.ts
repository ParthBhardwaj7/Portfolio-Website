/** Normalization helpers for lab-design data flow (DB values → view models). */

import type { SocialLink } from "./types";

type SocialRow = {
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
} | null;

function ensureUrl(value: string, platform: "github" | "linkedin" | "instagram" | "twitter"): string {
  const v = value.trim();
  if (!v) return "";
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("mailto:")) {
    return v.startsWith("http") || v.startsWith("mailto:") ? v : `https:${v}`;
  }
  const handle = v.replace(/^@/, "");
  switch (platform) {
    case "github":
      return `https://github.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${handle}`;
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
  }
}

/** DB Social row → display links (only real, non-empty values). */
export function toSocialLinks(social: SocialRow): SocialLink[] {
  if (!social) return [];
  const defs: { key: keyof NonNullable<SocialRow>; label: string }[] = [
    { key: "github", label: "GitHub" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "twitter", label: "Twitter / X" },
    { key: "instagram", label: "Instagram" },
  ];
  const links: SocialLink[] = [];
  for (const { key, label } of defs) {
    const raw = social[key];
    if (raw && raw.trim()) {
      links.push({ id: key, label, href: ensureUrl(raw, key) });
    }
  }
  return links;
}

/** Extract the first email address from free text (e.g. About.contactCaption). */
export function extractEmail(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return match ? match[0] : null;
}

/** Split a DB text blob into display paragraphs. */
export function splitParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** "Go, Python, React" → ["Go", "Python", "React"] */
export function splitList(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Flatten DB skill categories into a marquee label list (deduped). */
export function marqueeLabels(categories: { items: string[] }[]): string[] {
  const labels = categories.flatMap((c) => c.items);
  return Array.from(new Set(labels)).slice(0, 24);
}
