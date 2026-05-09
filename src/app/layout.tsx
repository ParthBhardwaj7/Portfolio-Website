import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getPublicAbout, getPublicSocial } from "@/lib/public-data";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const heroName = process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth";
const heroTitle = process.env.NEXT_PUBLIC_HERO_TITLE ?? "Backend Developer";
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const about = await getPublicAbout().catch(() => null);

  const title = `${heroName} — ${heroTitle}`;
  const description = `Personal portfolio of ${heroName}, a ${heroTitle} specialising in APIs, scalable systems, and full-stack web engineering.`;

  const favicon = about?.favicon?.trim() || null;
  const ogImage = about?.ogImage?.trim() || null;

  return {
    metadataBase: new URL(siteUrl),

    title: {
      default: title,
      template: `%s | ${heroName}`,
    },
    description,
    keywords: [heroName, heroTitle, "portfolio", "backend developer", "full stack", "web development", "API", "Next.js"],
    authors: [{ name: heroName }],
    creator: heroName,

    // Favicon / browser tab icon
    ...(favicon
      ? {
          icons: {
            icon: favicon,
            shortcut: favicon,
            apple: favicon,
          },
        }
      : {}),

    openGraph: {
      type: "website",
      url: siteUrl,
      title,
      description,
      siteName: `${heroName} Portfolio`,
      locale: "en_US",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },

    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },

    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },

    alternates: {
      canonical: siteUrl,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const social = await getPublicSocial().catch(() => null);
  const sameAs = [
    social?.github,
    social?.linkedin,
    social?.instagram,
    social?.twitter,
  ].filter((v): v is string => Boolean(v && v.trim()));

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: heroName,
    jobTitle: heroTitle,
    url: siteUrl,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${heroName} Portfolio`,
    url: siteUrl,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          // safe because schema object is controlled server-side
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
