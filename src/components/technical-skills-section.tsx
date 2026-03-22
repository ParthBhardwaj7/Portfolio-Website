"use client";

import { motion } from "framer-motion";
import type { PublicSkillCategory } from "@/lib/public-data";

export function TechnicalSkillsSection({
  categories,
  heading,
}: {
  categories: PublicSkillCategory[];
  heading: string;
}) {
  if (!categories.length) {
    return (
      <div className="space-y-8">
        <div className="flex min-w-0 items-center gap-4">
          <h2 className="shrink-0 font-display text-xl uppercase tracking-[0.18em] text-foreground sm:text-2xl md:text-3xl">
            {heading}
          </h2>
          <div className="h-px min-w-0 flex-1 bg-border" />
        </div>
        <p className="text-sm text-muted">
          Add categories and skills in Admin → Skills — your technical expertise will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex min-w-0 items-center gap-4">
        <h2 className="shrink-0 font-display text-xl uppercase tracking-[0.14em] text-foreground sm:text-2xl md:text-3xl">
          {heading}
        </h2>
        <div className="h-px min-w-0 flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-12 sm:gap-14 md:grid-cols-2 md:gap-x-10 md:gap-y-12 xl:grid-cols-3 xl:gap-x-12">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0.1 }}
            transition={{ duration: 0.75, delay: Math.min(i * 0.1, 0.45), ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="mb-5 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted sm:text-xs">
              {cat.title}
            </h3>
            <ul className="flex flex-wrap gap-2.5">
              {cat.items.map((item) => (
                <li
                  key={item.id}
                  className="max-w-full rounded-md border border-border bg-background/40 px-3 py-2 text-left text-[0.8rem] leading-snug text-foreground sm:text-sm"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
