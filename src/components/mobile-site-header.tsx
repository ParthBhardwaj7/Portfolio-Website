"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { IconGitHub, IconInstagram, IconLinkedIn, IconMail, IconX } from "@/components/social-icons";
import { siteConfig } from "@/lib/site-config";
import { useSectionActive, type SectionId } from "@/hooks/use-section-active";

const links: { href: string; label: string; id: SectionId }[] = [
  { href: "#home", label: "Home", id: "home" },
  { href: "#works", label: "Works", id: "works" },
  { href: "#gallery", label: "Gallery", id: "gallery" },
  { href: "#contact", label: "Contact", id: "contact" },
];

const iconClass = "h-[18px] w-[18px]";

type Social = {
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
};

export function MobileSiteHeader({
  social,
  resumeUrl,
}: {
  social: Social;
  resumeUrl?: string | null;
}) {
  const active = useSectionActive();
  const email = siteConfig.contactEmail;

  const row: { href: string; label: string; node: ReactNode }[] = [];
  if (social.linkedin)
    row.push({ href: social.linkedin, label: "LinkedIn", node: <IconLinkedIn className={iconClass} /> });
  if (social.instagram)
    row.push({ href: social.instagram, label: "Instagram", node: <IconInstagram className={iconClass} /> });
  if (social.github)
    row.push({ href: social.github, label: "GitHub", node: <IconGitHub className={iconClass} /> });
  if (social.twitter)
    row.push({ href: social.twitter, label: "X", node: <IconX className={iconClass} /> });
  if (email)
    row.push({ href: `mailto:${email}`, label: "Email", node: <IconMail className={iconClass} /> });

  return (
    <header className="sticky top-0 z-[9998] border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-[1400px] items-start justify-between gap-3 px-4 py-4 sm:px-6 md:px-8">
        <nav className="flex min-w-0 flex-1 flex-row flex-wrap gap-x-4 gap-y-2 text-[0.62rem] uppercase tracking-[0.22em] text-muted">
          {links.map((l, i) => {
            const isActive = active === l.id;
            return (
              <motion.a
                key={l.href}
                href={l.href}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                className="group inline-flex flex-col"
              >
                <span className={isActive ? "text-foreground" : "text-muted"}>{l.label}</span>
                <span
                  className={`mt-0.5 h-px w-full origin-left bg-foreground transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </motion.a>
            );
          })}
          {resumeUrl ? (
            <motion.a
              key="resume"
              href="/api/public/resume"
              target="_blank"
              rel="noopener noreferrer"
              title="View résumé (PDF)"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * links.length }}
              className="group inline-flex flex-col"
            >
              <span className="text-muted">My résumé</span>
              <span className="mt-0.5 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </motion.a>
          ) : null}
        </nav>
        {row.length > 0 ? (
          <div className="flex shrink-0 flex-row items-center gap-4 pt-0.5 text-foreground">
            {row.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="text-muted transition-colors hover:text-foreground"
                aria-label={item.label}
              >
                {item.node}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
