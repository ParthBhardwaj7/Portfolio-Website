"use client";

import type { PortfolioItem } from "@/components/portfolio-card";
import { PortfolioCard } from "@/components/portfolio-card";

export function WorksScrollShowcase({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {items.map((item, index) => (
        <PortfolioCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
