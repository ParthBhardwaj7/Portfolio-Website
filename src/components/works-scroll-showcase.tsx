"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { PortfolioItem } from "@/components/portfolio-card";
import { PortfolioCard } from "@/components/portfolio-card";
import { ProjectModal } from "@/components/project-modal";

export function WorksScrollShowcase({ items }: { items: PortfolioItem[] }) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        {items.map((item, index) => (
          <PortfolioCard key={item.id} item={item} index={index} onOpen={setSelected} />
        ))}
      </div>

      <AnimatePresence>
        {selected ? (
          <ProjectModal item={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
