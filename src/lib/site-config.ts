export const siteConfig = {
  heroName: process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth",
  heroTitle: process.env.NEXT_PUBLIC_HERO_TITLE ?? "Backend Developer",
  /** Optional résumé PDF URL — shows View/Download + nav when Admin → About has no `resumeUrl` */
  resumeUrl: process.env.NEXT_PUBLIC_RESUME_URL?.trim() || null,
  /** Optional mail icon in sidebar; set in .env as NEXT_PUBLIC_CONTACT_EMAIL */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
  /** Main heading above the categorized skills grid */
  skillsSectionHeading:
    process.env.NEXT_PUBLIC_SKILLS_HEADING?.trim() || "Technical skills",
  /** Footer line © … */
  footerName: process.env.NEXT_PUBLIC_FOOTER_NAME?.trim() || process.env.NEXT_PUBLIC_HERO_NAME || "Portfolio",
};

/** Admin DB value wins; else optional `NEXT_PUBLIC_RESUME_URL` from .env */
export function resolvePublicResumeUrl(dbResume: string | null | undefined): string | null {
  const fromDb = dbResume?.trim() || null;
  if (fromDb) return fromDb;
  return siteConfig.resumeUrl;
}
