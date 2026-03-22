"use client";

import { motion } from "framer-motion";
import { IconGitHub, IconInstagram, IconLinkedIn, IconX } from "@/components/social-icons";

type Props = {
  github?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  twitter?: string | null;
};

const iconClass = "h-[18px] w-[18px]";

const items = [
  { key: "github" as const, label: "GitHub", Icon: IconGitHub },
  { key: "linkedin" as const, label: "LinkedIn", Icon: IconLinkedIn },
  { key: "instagram" as const, label: "Instagram", Icon: IconInstagram },
  { key: "twitter" as const, label: "X", Icon: IconX },
];

export function SocialLinks({ github, linkedin, instagram, twitter }: Props) {
  const map = { github, linkedin, instagram, twitter };

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ key, label, Icon }, i) => {
        const href = map[key];
        if (!href) return null;
        return (
          <motion.a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -2 }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-foreground"
            aria-label={label}
          >
            <Icon className={iconClass} />
          </motion.a>
        );
      })}
    </div>
  );
}
