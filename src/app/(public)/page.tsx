import { ContactSection } from "@/components/contact-section";
import { GalleryMasonry } from "@/components/gallery-masonry";
import { HomeHero } from "@/components/home-hero";
import { PortfolioCard } from "@/components/portfolio-card";
import { ScrollSection } from "@/components/scroll-section";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { TechnicalSkillsSection } from "@/components/technical-skills-section";
import {
  getPublicAbout,
  getPublicPortfolio,
  getPublicSkillCategories,
} from "@/lib/public-data";
import { DEFAULT_CONTACT_CAPTION, DEFAULT_HERO_TAGLINE } from "@/lib/copy-defaults";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [about, skillCategories, portfolioRaw] = await Promise.all([
    getPublicAbout(),
    getPublicSkillCategories(),
    getPublicPortfolio(),
  ]);

  const portfolio = Array.isArray(portfolioRaw) ? portfolioRaw : [];

  const aboutText =
    about?.content ??
    "Backend engineer focused on APIs, data, and reliability. Connect your database to replace this text in the admin panel.";

  const galleryItems = portfolio.filter((p) => p?.image);

  const heroTagline = (about?.heroTagline?.trim() || DEFAULT_HERO_TAGLINE) as string;
  const contactCaption = (about?.contactCaption?.trim() || DEFAULT_CONTACT_CAPTION) as string;

  return (
    <div className="space-y-20 sm:space-y-24 lg:space-y-32">
      <HomeHero about={about} aboutText={aboutText} heroTagline={heroTagline} />

      <ScrollSection id="works" className="scroll-mt-32 space-y-10 lg:scroll-mt-28">
        <SectionHeading
          title="Works"
          subtitle="Selected projects and experiments."
        />
        {portfolio.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
            Projects coming soon — add items from the admin panel.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {portfolio.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={{
                  ...item,
                  createdAt: item.createdAt,
                }}
                index={index}
              />
            ))}
          </div>
        )}
      </ScrollSection>

      <ScrollSection id="gallery" className="scroll-mt-32 space-y-10 lg:scroll-mt-28">
        <SectionHeading
          title="Gallery"
          subtitle="Visual snapshots from the portfolio."
        />
        <GalleryMasonry items={galleryItems} />
      </ScrollSection>

      <ScrollSection id="skills" className="scroll-mt-32 lg:scroll-mt-28">
        <TechnicalSkillsSection
          categories={skillCategories}
          heading={siteConfig.skillsSectionHeading}
        />
      </ScrollSection>

      <ScrollSection id="contact" className="scroll-mt-32 space-y-10 pb-4 lg:scroll-mt-28">
        <ContactSection
          profileImage={about?.profileImage ?? null}
          displayName={String(siteConfig.heroName ?? "Portfolio")}
          contactCaption={contactCaption}
        />
      </ScrollSection>

      <SiteFooter />
    </div>
  );
}
