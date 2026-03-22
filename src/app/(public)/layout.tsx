import { MobileSiteHeader } from "@/components/mobile-site-header";
import { SidebarSocial } from "@/components/sidebar-social";
import { SiteRefreshOnFocus } from "@/components/site-refresh-on-focus";
import { ThemeToggle } from "@/components/theme-toggle";
import { VerticalNav } from "@/components/vertical-nav";
import { getPublicSocial } from "@/lib/public-data";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const social = await getPublicSocial();

  return (
    <div className="relative min-h-screen">
      <SiteRefreshOnFocus />
      <div className="pointer-events-none fixed right-5 top-5 z-[10000] hidden lg:block sm:right-8 sm:top-8 md:right-10 md:top-10">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <MobileSiteHeader social={social} />
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 pb-20 pt-6 sm:gap-12 sm:px-6 sm:pt-8 md:px-8 lg:flex-row lg:gap-12 lg:px-10 lg:pt-14 xl:gap-16">
        <aside className="hidden shrink-0 flex-col lg:flex lg:w-44 xl:w-52">
          <VerticalNav />
          <SidebarSocial social={social} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
