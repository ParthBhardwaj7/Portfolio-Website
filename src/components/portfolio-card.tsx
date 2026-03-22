"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  createdAt: string | Date;
};

export function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  const href = item.link ?? "#";
  const hasImage = Boolean(item.image);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group overflow-hidden rounded-2xl border border-border bg-background/40"
    >
      <a href={href} target={item.link ? "_blank" : undefined} rel="noreferrer" className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/20">
          {hasImage && item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              unoptimized={item.image.startsWith("/uploads/")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
          )}
        </div>
        <div className="space-y-2 p-5">
          <h3 className="font-display text-lg tracking-tight">{item.title}</h3>
          <p className="line-clamp-3 text-sm text-muted">{item.description}</p>
        </div>
      </a>
    </motion.article>
  );
}
