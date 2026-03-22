"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AboutTypewriter } from "@/components/about-typewriter";
import { TextWithEmailLink } from "@/components/text-with-email-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site-config";

type About = {
  content: string | null;
  profileImage: string | null;
  resumeUrl?: string | null;
} | null;

export function HomeHero({
  about,
  aboutText,
  heroTagline,
  resumeUrl,
}: {
  about: About;
  aboutText: string;
  heroTagline: string;
  resumeUrl?: string | null;
}) {
  const resumeHref = (resumeUrl ?? about?.resumeUrl)?.trim() || null;
  return (
    <motion.section
      id="home"
      className="snap-start scroll-mt-6 sm:scroll-mt-8 lg:scroll-mt-24 flex min-h-[100dvh] flex-col justify-center pb-16 sm:pb-20"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 flex justify-center lg:hidden">
        <ThemeToggle />
      </div>

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] lg:items-start lg:gap-12 xl:gap-16">
        <div className="min-w-0 self-start space-y-6 sm:space-y-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-[0.65rem] uppercase tracking-[0.4em] text-muted sm:text-xs"
          >
            Portfolio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04 }}
            className="font-display text-[clamp(2.15rem,9vw,4.5rem)] font-light uppercase leading-[1.05] tracking-[0.1em] text-foreground sm:tracking-[0.14em]"
          >
            {siteConfig.heroName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-base font-normal normal-case tracking-normal text-muted sm:text-lg md:text-xl"
          >
            {siteConfig.heroTitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="max-w-xl space-y-5 text-sm leading-relaxed text-muted sm:text-base"
          >
            <TextWithEmailLink
              text={heroTagline}
              className="text-muted"
              linkClassName="font-medium text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent"
            />
            {resumeHref ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-5">
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-accent/60 bg-accent/10 px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground shadow-sm transition-colors hover:border-accent hover:bg-accent/20"
                >
                  View résumé
                </a>
                <a
                  href={resumeHref}
                  download
                  className="inline-flex items-center rounded-full border border-border px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  Download PDF
                </a>
              </div>
            ) : null}
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="min-w-0 self-start lg:pt-1"
        >
          <div className="flex min-w-0 items-center gap-4">
            <h2 className="shrink-0 text-xs uppercase tracking-[0.28em] text-muted sm:text-sm">
              About me
            </h2>
            <div className="h-px min-w-0 flex-1 bg-border" />
          </div>
          <div className="mt-8 flex w-full min-w-0 flex-col gap-6">
            {about?.profileImage ? (
              <div className="relative h-24 w-24 shrink-0 self-start overflow-hidden rounded-full border border-border sm:h-28 sm:w-28 md:h-32 md:w-32">
                <Image
                  src={about.profileImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized={about.profileImage.startsWith("/uploads/")}
                />
              </div>
            ) : null}
            <AboutTypewriter
              text={aboutText}
              speed={16}
              className="w-full min-w-0"
            />
          </div>
        </motion.aside>
      </div>
    </motion.section>
  );
}
