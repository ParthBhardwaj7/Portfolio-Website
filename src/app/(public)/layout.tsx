import dynamic from "next/dynamic";
import { BackgroundSystem } from "@/components/lab/background-system";
import { SmoothScroll } from "@/components/lab/smooth-scroll";
import { CursorProvider } from "@/components/lab/cursor";
import { ScrollProgress } from "@/components/lab/scroll-progress";
import { LoadingScreen } from "@/components/lab/loading-screen";
import { Navbar } from "@/components/lab/navbar";
import { Footer } from "@/components/lab/footer";
import { CommandPalette } from "@/components/lab/command-palette";
import { getPublicAbout, getPublicSocial } from "@/lib/public-data";
import { toSocialLinks, extractEmail } from "@/lib/lab/normalize";

const ChatWidget = dynamic(() => import("@/components/chat-widget").then((m) => m.ChatWidget), {
  ssr: false,
});

/** Cached static shell; admin mutations call `revalidatePublicPages()` for instant updates. */
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [about, social] = await Promise.all([
    getPublicAbout().catch(() => null),
    getPublicSocial().catch(() => null),
  ]);

  const heroName = process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth";
  const socials = toSocialLinks(social);
  const email = extractEmail(about?.contactCaption) ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null;

  return (
    <SmoothScroll>
      <CursorProvider>
        <a
          href="#main"
          className="sr-only left-4 top-4 z-[10001] rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:not-sr-only focus:absolute focus:ring-2 focus:ring-copper"
        >
          Skip to main content
        </a>

        <LoadingScreen name={heroName.toUpperCase()} tagline="Backend × AI × Cloud" />
        <ScrollProgress />
        <BackgroundSystem />
        <Navbar
          shortName={heroName.split(" ")[0] ?? heroName}
          initials={getInitials(heroName)}
        />
        <CommandPalette socials={socials} email={email} />

        <main id="main" className="relative z-10 min-w-0 outline-none" tabIndex={-1}>
          {children}
          <Footer
            name={heroName}
            tagline="Backend × AI × Cloud"
            bioShort="Backend & AI engineer building scalable systems, cloud infrastructure and intelligent applications."
            email={email}
            location="India"
            availability="Open to opportunities"
            socials={socials}
          />
        </main>

        {about?.chatEnabled ? <ChatWidget /> : null}
      </CursorProvider>
    </SmoothScroll>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
