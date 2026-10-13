import { Hero } from "@/components/lab/hero";
import { AboutSection } from "@/components/lab/about-section";
import { EngineeringPhilosophy } from "@/components/lab/engineering-philosophy";
import { ProjectsSection } from "@/components/lab/projects-section";
import { OpenSourceStrip } from "@/components/lab/opensource-strip";
import { SkillsMarquee } from "@/components/lab/skills-marquee";
import { TechStack } from "@/components/lab/tech-stack";
import { ExperienceSection } from "@/components/lab/experience-section";
import { CertificationsSection } from "@/components/lab/certifications-section";
import { GallerySection } from "@/components/lab/gallery-section";
import { ResumeSection } from "@/components/lab/resume-section";
import { ContactSection } from "@/components/lab/contact-section";
import { TournamentSection } from "@/components/lab/tournament-section";
import {
  getPublicAbout,
  getPublicCertifications,
  getPublicExperience,
  getPublicPortfolio,
  getPublicSkillCategories,
  getPublicSocial,
} from "@/lib/public-data";
import { getGithubSnapshot } from "@/lib/github";
import { splitParagraphs, splitList, extractEmail, toSocialLinks, marqueeLabels } from "@/lib/lab/normalize";
import type {
  ProjectVM,
  ExperienceVM,
  SkillCategoryVM,
  CertificationVM,
  GalleryTileVM,
  OssStats,
} from "@/lib/lab/types";

export default async function HomePage() {
  const [about, skillCategories, portfolioRaw, certifications, experience, social, github] =
    await Promise.all([
      getPublicAbout(),
      getPublicSkillCategories(),
      getPublicPortfolio(),
      getPublicCertifications(),
      getPublicExperience(),
      getPublicSocial(),
      getGithubSnapshot(),
    ]);

  const portfolio = (Array.isArray(portfolioRaw) ? portfolioRaw : [])
    .slice()
    .sort((a, b) => {
      const sa = (a as { sortOrder?: number }).sortOrder ?? 999;
      const sb = (b as { sortOrder?: number }).sortOrder ?? 999;
      return sa - sb;
    });

  /* ------------------------- view models ------------------------- */

  const projects: ProjectVM[] = portfolio.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    slug: p.slug || null,
    techStack: splitList(p.techStack),
    image: p.image || null,
    link: p.link || null,
    liveUrl: p.liveUrl || null,
    videoUrl: p.videoUrl || null,
    problem: p.problem || null,
    solution: p.solution || null,
    architecture: p.architecture || null,
    featured: Boolean(p.featured),
    gallery: (p.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption ?? null,
    })),
  }));

  const experienceVMs: ExperienceVM[] = experience.map((e) => ({
    id: e.id,
    year: e.year,
    title: e.title,
    org: e.org ?? null,
    type: e.type,
    description: e.description,
    technologies: splitList(e.technologies),
    url: e.url ?? null,
  }));

  const skills: SkillCategoryVM[] = skillCategories.map((c) => ({
    id: c.id,
    title: c.title,
    items: (c.items ?? []).map((i) => i.label),
  }));

  const certificationsVMs: CertificationVM[] = certifications.map((c) => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    issueDate: c.issueDate ?? null,
    credentialUrl: c.credentialUrl ?? null,
    imageUrl: c.imageUrl ?? null,
    pdfUrl: c.pdfUrl ?? null,
  }));

  // Gallery — real cover media first, then per-project screenshots
  const galleryTiles: GalleryTileVM[] = portfolio.flatMap((p) => {
    const tiles: GalleryTileVM[] = [];
    if (p.image || p.videoUrl) {
      tiles.push({
        id: `cover-${p.id}`,
        image: p.image || null,
        videoUrl: p.videoUrl || null,
        caption: p.galleryCaption || null,
        projectTitle: p.title,
        slug: p.slug || null,
      });
    }
    for (const img of p.images ?? []) {
      tiles.push({
        id: `img-${img.id}`,
        image: img.url,
        videoUrl: null,
        caption: img.caption || null,
        projectTitle: p.title,
        slug: p.slug || null,
      });
    }
    return tiles;
  });

  // Real GitHub activity (live API with verified fallback)
  const merged = github.pulls.filter((p) => p.merged);
  const ossStats: OssStats = {
    mergedPRs: merged.length,
    source: github.source,
    profile: github.profile
      ? {
          login: github.profile.login,
          htmlUrl: github.profile.htmlUrl,
          publicRepos: github.profile.publicRepos,
          followers: github.profile.followers,
        }
      : null,
    topRepos: github.repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        description: r.description ?? null,
        language: r.language ?? null,
        url: r.url,
        stars: r.stars,
      })),
  };

  /* --------------------------- copy ------------------------------ */

  const heroName = process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth Bhardwaj";
  const heroLines = heroName
    .trim()
    .split(/\s+/)
    .map((w) => w.toUpperCase())
    .slice(0, 3);
  // Professional support line — the giant name above already says who he is,
  // so the greeting tagline stays out of the hero.
  const supportLine =
    "I build scalable backend systems, cloud infrastructure and intelligent software.";
  const email = extractEmail(about?.contactCaption) ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null;
  const socials = toSocialLinks(social);
  const aboutParagraphs = splitParagraphs(about?.content);
  const exploringLabels =
    skills.find((c) => /ai|emerging/i.test(c.title))?.items ?? [];

  return (
    <>
      <Hero
        heroLines={heroLines}
        supportLine={supportLine}
        eyebrow="Backend Engineer × AI × Cloud"
        availability="Open to opportunities"
      />

      <div>
        <AboutSection
          paragraphs={aboutParagraphs}
          profileImage={about?.profileImage || null}
          exploringLabels={exploringLabels}
        />

        <EngineeringPhilosophy />

        <ProjectsSection projects={projects} />

        <OpenSourceStrip stats={ossStats} />

        <SkillsMarquee labels={marqueeLabels(skills)} />

        <TechStack categories={skills} />

        <ExperienceSection entries={experienceVMs} />

        <CertificationsSection certifications={certificationsVMs} />

        <GallerySection tiles={galleryTiles} />

        <ResumeSection
          name={heroName}
          role={process.env.NEXT_PUBLIC_HERO_TITLE ?? "Backend Engineer"}
          location="India"
          email={email}
          experience={experienceVMs}
          certifications={certificationsVMs}
          skillCategories={skills}
        />

        <ContactSection email={email} socials={socials} />

        <TournamentSection />
      </div>
    </>
  );
}
