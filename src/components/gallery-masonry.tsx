"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Item = { id: string; image: string | null };

export function GalleryMasonry({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
        No images yet. Upload cover images on portfolio items.
      </div>
    );
  }
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.85,
            delay: Math.min(i * 0.1, 0.6),
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border"
        >
          <div className="relative aspect-[4/5] w-full">
            {p.image ? (
              <Image
                src={p.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
                loading="lazy"
                unoptimized={p.image.startsWith("/uploads/")}
              />
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
