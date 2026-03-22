export const siteConfig = {
  heroName: process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth",
  heroTitle: process.env.NEXT_PUBLIC_HERO_TITLE ?? "Backend Developer",
  /** Optional mail icon in sidebar; set in .env as NEXT_PUBLIC_CONTACT_EMAIL */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
  /** Main heading above the categorized skills grid */
  skillsSectionHeading:
    process.env.NEXT_PUBLIC_SKILLS_HEADING?.trim() || "Technical skills",
  /** Footer line © … */
  footerName: process.env.NEXT_PUBLIC_FOOTER_NAME?.trim() || process.env.NEXT_PUBLIC_HERO_NAME || "Portfolio",
};
