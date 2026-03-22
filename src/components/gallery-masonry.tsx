"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export type GalleryItem = {
  id: string;
  image: string | null;
  videoUrl?: string | null;
  galleryCaption?: string | null;
};

function GalleryTile({ p, i }: { p: GalleryItem; i: number }) {
  const [videoBroken, setVideoBroken] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const videoSrc = p.videoUrl?.trim() || null;
  const showVideo = Boolean(videoSrc && !videoBroken);
  const hasImage = Boolean(p.image);
  const showImage = hasImage && p.image && !imageFailed;

  const transition =
    reduceMotion === true
      ? { duration: 0.2 }
      : {
          duration: 0.85,
          delay: Math.min(i * 0.1, 0.6),
          ease: [0.22, 1, 0.36, 1] as const,
        };

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={transition}
      className="group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border"
    >
      <div className="relative aspect-[4/5] w-full">
        {showVideo ? (
          <>
            <video
              src={videoSrc!}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              poster={hasImage && p.image ? p.image : undefined}
              onError={() => setVideoBroken(true)}
            />
            {p.galleryCaption?.trim() ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent px-3 pb-3 pt-10">
                <p className="text-center text-xs font-medium leading-snug text-foreground sm:text-sm">
                  {p.galleryCaption.trim()}
                </p>
              </div>
            ) : null}
          </>
        ) : null}
        {!showVideo && showImage && p.image ? (
          <>
            <Image
              src={p.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
              loading="lazy"
              unoptimized={p.image.startsWith("/uploads/")}
              onError={() => setImageFailed(true)}
            />
            {p.galleryCaption?.trim() ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent px-3 pb-3 pt-10">
                <p className="text-center text-xs font-medium leading-snug text-foreground sm:text-sm">
                  {p.galleryCaption.trim()}
                </p>
              </div>
            ) : null}
          </>
        ) : null}
        {!showVideo && (!hasImage || imageFailed) ? (
          <div className="flex h-full min-h-[120px] items-center justify-center bg-muted/20 px-2 text-center text-xs text-muted">
            No media for this item
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
        No gallery media yet. Add a cover image or video in Admin → Portfolio for a project.
      </div>
    );
  }
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((p, i) => (
        <GalleryTile key={p.id} p={p} i={i} />
      ))}
    </div>
  );
}
