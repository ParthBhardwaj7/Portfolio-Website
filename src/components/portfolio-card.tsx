"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export type PortfolioImage = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  galleryCaption?: string | null;
  videoUrl?: string | null;
  createdAt: string | Date;
  images?: PortfolioImage[];
};

export function PortfolioCard({
  item,
  index,
  onOpen,
}: {
  item: PortfolioItem;
  index: number;
  onOpen: (item: PortfolioItem) => void;
}) {
  const [videoBroken, setVideoBroken] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const videoSrc = item.videoUrl?.trim() || null;
  const showVideo = Boolean(videoSrc && !videoBroken);
  const hasImage = Boolean(item.image);
  const showImage = hasImage && item.image && !imageFailed;

  const motionTransition =
    reduceMotion === true
      ? { duration: 0.2 }
      : {
          duration: 0.8,
          delay: index * 0.12,
          ease: [0.22, 1, 0.36, 1] as const,
        };

  return (
    <motion.article
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={motionTransition}
      className="group overflow-hidden rounded-2xl border border-border bg-background/40"
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full text-left"
        aria-label={`View details for ${item.title}`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/20">
          {showVideo ? (
            <video
              src={videoSrc!}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              muted
              loop
              playsInline
              autoPlay
              poster={hasImage && item.image ? item.image : undefined}
              onError={() => setVideoBroken(true)}
            />
          ) : null}
          {!showVideo && showImage && item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {!showVideo && (!hasImage || imageFailed) ? (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image or video
            </div>
          ) : null}

          {/* Extra images count badge */}
          {(item.images?.length ?? 0) > 0 ? (
            <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[0.6rem] font-medium tracking-wide text-foreground/70 backdrop-blur-sm">
              +{item.images!.length} photos
            </div>
          ) : null}
        </div>
        <div className="space-y-2 p-5">
          <h3 className="font-display text-lg tracking-tight">{item.title}</h3>
          <p className="line-clamp-2 text-sm text-muted">{item.description}</p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-medium text-foreground/50 group-hover:text-foreground/80 transition-colors">
              View details →
            </span>
            {item.link ? (
              <span className="text-xs text-foreground/40">· has live link</span>
            ) : null}
          </div>
        </div>
      </button>
    </motion.article>
  );
}
