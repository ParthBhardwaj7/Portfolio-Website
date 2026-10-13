import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getPublicAbout, getPublicSocial } from "@/lib/public-data";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const heroName = process.env.NEXT_PUBLIC_HERO_NAME ?? "Parth";
const heroTitle = process.env.NEXT_PUBLIC_HERO_TITLE ?? "Backend Developer";
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const about = await getPublicAbout().catch(() => null);

  const title = `${heroName} — ${heroTitle}`;
  const description = `Personal portfolio of ${heroName}, a ${heroTitle} building scalable backend systems, cloud infrastructure and intelligent applications.`;

  const favicon = about?.favicon?.trim() || null;
  const ogImage = about?.ogImage?.trim() || null;

  return {
    metadataBase: new URL(siteUrl),

    title: {
      default: title,
      template: `%s | ${heroName}`,
    },
    description,
    keywords: [
      heroName,
      heroTitle,
      "portfolio",
      "backend engineer",
      "AI engineer",
      "cloud",
      "Go",
      "Python",
      "AWS",
      "Kubernetes",
      "distributed systems",
      "Next.js",
    ],
    authors: [{ name: heroName }],
    creator: heroName,

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
    <html lang="en" suppressHydrationWarning className="dark">
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
      <body
        className={`${GeistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} noise-overlay font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
