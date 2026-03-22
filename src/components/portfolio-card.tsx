"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { isUnoptimizedImageSrc } from "@/lib/remote-image";
import { useState } from "react";

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  galleryCaption?: string | null;
  videoUrl?: string | null;
  createdAt: string | Date;
};

export function PortfolioCard({ item, index }: { item: PortfolioItem; index: number }) {
  const [videoBroken, setVideoBroken] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const href = item.link ?? "#";
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
      <a href={href} target={item.link ? "_blank" : undefined} rel="noreferrer" className="block">
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
              unoptimized={isUnoptimizedImageSrc(item.image)}
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {!showVideo && (!hasImage || imageFailed) ? (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image or video
            </div>
          ) : null}
        </div>
        <div className="space-y-2 p-5">
          <h3 className="font-display text-lg tracking-tight">{item.title}</h3>
          <p className="line-clamp-3 text-sm text-muted">{item.description}</p>
        </div>
      </a>
    </motion.article>
  );
}
