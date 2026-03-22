import { MobileSiteHeader } from "@/components/mobile-site-header";
import { SidebarSocial } from "@/components/sidebar-social";
import { SiteIntroOverlay } from "@/components/site-intro-overlay";
import { SiteRefreshOnFocus } from "@/components/site-refresh-on-focus";
import { ThemeToggle } from "@/components/theme-toggle";
import { VerticalNav } from "@/components/vertical-nav";
import { getPublicAbout, getPublicSocial } from "@/lib/public-data";
import { resolvePublicResumeUrl } from "@/lib/site-config";

/** Cached static shell; admin mutations call `revalidatePublicPages()` for instant updates. */
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [social, about] = await Promise.all([getPublicSocial(), getPublicAbout()]);
  const resumeUrl = resolvePublicResumeUrl(about?.resumeUrl);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <a
        href="#main"
        className="sr-only left-4 top-4 z-[10001] rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background transition focus:not-sr-only focus:absolute focus:ring-2 focus:ring-accent"
      >
        Skip to main content
      </a>
      <SiteRefreshOnFocus />
      <SiteIntroOverlay />
      <div className="pointer-events-none fixed right-5 top-5 z-[10000] hidden lg:block sm:right-8 sm:top-8 md:right-10 md:top-10">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <MobileSiteHeader social={social} resumeUrl={resumeUrl} />
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 pb-20 pt-6 sm:gap-12 sm:px-6 sm:pt-8 md:px-8 lg:flex-row lg:gap-12 lg:px-10 lg:pt-14 xl:gap-16">
        <aside className="hidden shrink-0 flex-col lg:flex lg:w-44 xl:w-52" aria-label="Site">
          <VerticalNav resumeUrl={resumeUrl} />
          <SidebarSocial social={social} />
        </aside>
        <main id="main" className="min-w-0 flex-1 outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
