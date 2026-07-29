import { ContactSection } from "@/components/contact-section";
import { GalleryMasonry } from "@/components/gallery-masonry";
import { HomeHero } from "@/components/home-hero";
import { WorksScrollShowcase } from "@/components/works-scroll-showcase";
import { ScrollSection } from "@/components/scroll-section";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { TechnicalSkillsSection } from "@/components/technical-skills-section";
import { CertificationsSection } from "@/components/certifications-section";
import {
  getPublicAbout,
  getPublicCertifications,
  getPublicPortfolio,
  getPublicSkillCategories,
} from "@/lib/public-data";
import { DEFAULT_CONTACT_CAPTION, DEFAULT_HERO_TAGLINE } from "@/lib/copy-defaults";
import { resolvePublicResumeUrl, siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const [about, skillCategories, portfolioRaw, certifications] = await Promise.all([
    getPublicAbout(),
    getPublicSkillCategories(),
    getPublicPortfolio(),
    getPublicCertifications(),
  ]);

  const portfolio = Array.isArray(portfolioRaw) ? portfolioRaw : [];

  const aboutText =
    about?.content ??
    "Backend engineer focused on APIs, data, and reliability. Connect your database to replace this text in the admin panel.";

  // Build gallery: cover image/video first, then extra gallery images per project
  const galleryItems = portfolio.flatMap((p) => {
    const tiles = [];
    if (p?.image || p?.videoUrl) {
      tiles.push({ id: p.id, image: p.image, videoUrl: p.videoUrl, galleryCaption: p.galleryCaption });
    }
    for (const img of p?.images ?? []) {
      tiles.push({ id: `${p.id}-${img.id}`, image: img.url, videoUrl: null, galleryCaption: img.caption });
    }
    return tiles;
  });

  const heroTagline = (about?.heroTagline?.trim() || DEFAULT_HERO_TAGLINE) as string;
  const contactCaption = (about?.contactCaption?.trim() || DEFAULT_CONTACT_CAPTION) as string;

  return (
    <div className="flex flex-col">
      <HomeHero
        about={about}
        aboutText={aboutText}
        heroTagline={heroTagline}
        resumeUrl={resolvePublicResumeUrl(about?.resumeUrl)}
      />

      <ScrollSection id="works" className="space-y-8 pt-20 sm:pt-24 lg:pt-28">
        <SectionHeading
          title="Works"
          subtitle="Selected projects and experiments."
        />
        {portfolio.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
            Projects coming soon — add items from the admin panel.
          </div>
        ) : (
          <WorksScrollShowcase items={portfolio} />
        )}
      </ScrollSection>

      <ScrollSection id="gallery" className="space-y-10 pt-20 sm:pt-24 lg:pt-28">
        <SectionHeading
          title="Gallery"
          subtitle="Visual snapshots from the portfolio."
        />
        <GalleryMasonry items={galleryItems} />
      </ScrollSection>

      <ScrollSection id="skills" className="pt-20 sm:pt-24 lg:pt-28">
        <TechnicalSkillsSection
          categories={skillCategories}
          heading={siteConfig.skillsSectionHeading}
        />
      </ScrollSection>

      {certifications.length > 0 && (
        <ScrollSection id="certifications" className="space-y-8 pt-20 sm:pt-24 lg:pt-28">
          <SectionHeading
            title="Certifications"
            subtitle="Credentials and achievements."
          />
          <CertificationsSection certifications={certifications} />
        </ScrollSection>
      )}

      <ScrollSection id="contact" className="space-y-10 pb-4 pt-20 sm:pt-24 lg:pt-28">
        <ContactSection
          profileImage={about?.profileImage ?? null}
          displayName={String(siteConfig.heroName ?? "Portfolio")}
          contactCaption={contactCaption}
        />
      </ScrollSection>

      <ScrollSection id="leaderboard" className="space-y-8 pt-20 sm:pt-24 lg:pt-28">
        <SectionHeading
          title="Live Leaderboard"
          subtitle="Real-time tournament updates synced live."
        />
        <div className="w-full max-w-5xl mx-auto px-4">
          <iframe 
            src="https://leaderboard.parthbhardwaj.com/embed/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5" 
            width="100%" 
            height="700px" 
            style={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}
            scrolling="no"
            title="Live Leaderboard"
          />
        </div>
      </ScrollSection>

      <SiteFooter />
    </div>
  );
}

