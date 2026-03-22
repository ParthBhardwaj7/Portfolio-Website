"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { IconGitHub, IconInstagram, IconLinkedIn, IconMail, IconX } from "@/components/social-icons";
import { siteConfig } from "@/lib/site-config";

type Social = {
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
};

const iconClass = "h-[18px] w-[18px]";

export function SidebarSocial({ social }: { social: Social }) {
  const email = siteConfig.contactEmail;
  const entries: { href: string; label: string; node: ReactNode }[] = [];

  if (social.linkedin)
    entries.push({
      href: social.linkedin,
      label: "LinkedIn",
      node: <IconLinkedIn className={iconClass} />,
    });
  if (social.instagram)
    entries.push({
      href: social.instagram,
      label: "Instagram",
      node: <IconInstagram className={iconClass} />,
    });
  if (social.github)
    entries.push({
      href: social.github,
      label: "GitHub",
      node: <IconGitHub className={iconClass} />,
    });
  if (social.twitter)
    entries.push({
      href: social.twitter,
      label: "X",
      node: <IconX className={iconClass} />,
    });
  if (email)
    entries.push({
      href: `mailto:${email}`,
      label: "Email",
      node: <IconMail className={iconClass} />,
    });

  if (entries.length === 0) return null;

  return (
    <div className="mt-10 flex flex-col gap-5 border-t border-border/80 pt-8">
      {entries.map((item, i) => (
        <motion.a
          key={item.label}
          href={item.href}
          target={item.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 * i }}
          className="text-muted transition-colors hover:text-foreground"
          aria-label={item.label}
        >
          {item.node}
        </motion.a>
      ))}
    </div>
  );
}
