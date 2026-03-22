"use client";

import { motion } from "framer-motion";
import { useSectionActive, type SectionId } from "@/hooks/use-section-active";

const links: { href: string; label: string; id: SectionId }[] = [
  { href: "#home", label: "Home", id: "home" },
  { href: "#works", label: "Works", id: "works" },
  { href: "#gallery", label: "Gallery", id: "gallery" },
  { href: "#contact", label: "Contact", id: "contact" },
];

export function VerticalNav({ resumeUrl }: { resumeUrl?: string | null }) {
  const active = useSectionActive();

  return (
    <nav className="flex flex-row flex-wrap gap-x-8 gap-y-4 text-sm uppercase tracking-[0.28em] lg:flex-col lg:gap-7 lg:gap-x-0">
      {links.map((l, i) => {
        const isActive = active === l.id;
        return (
          <motion.a
            key={l.href}
            href={l.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="group relative inline-flex w-fit flex-col"
          >
            <span
              className={`transition-colors ${
                isActive ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </span>
            <span
              className={`mt-1 h-px w-full origin-left bg-foreground transition-transform duration-300 ${
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </motion.a>
        );
      })}
      {resumeUrl ? (
        <motion.a
          key="resume"
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View résumé (PDF)"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * links.length }}
          className="group relative inline-flex w-fit flex-col"
        >
          <span className="text-muted transition-colors hover:text-foreground">My résumé</span>
          <span className="mt-1 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
        </motion.a>
      ) : null}
    </nav>
  );
}
