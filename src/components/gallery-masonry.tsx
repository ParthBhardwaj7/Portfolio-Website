"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type GalleryItem = {
  id: string;
  image: string | null;
  videoUrl?: string | null;
  galleryCaption?: string | null;
};

function GalleryTile({ p, i }: { p: GalleryItem; i: number }) {
  const [videoBroken, setVideoBroken] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [revealVideo, setRevealVideo] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const videoSrc = p.videoUrl?.trim() || null;
  const showVideo = Boolean(videoSrc && !videoBroken);
  const hasImage = Boolean(p.image);
  const showImage = hasImage && p.image && !imageFailed;
  /** Cover photo + clip: show still first; hover/tap reveals video (poster alone is unreliable for Cloudinary). */
  const hasBoth = Boolean(showImage && showVideo && !reduceMotion);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setCoarsePointer(mq.matches);
    const fn = () => setCoarsePointer(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (!hasBoth) return;
    if (revealVideo) void videoRef.current?.play().catch(() => {});
    else {
      const el = videoRef.current;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    }
  }, [revealVideo, hasBoth]);

  const transition =
    reduceMotion === true
      ? { duration: 0.2 }
      : {
          duration: 0.85,
          delay: Math.min(i * 0.1, 0.6),
          ease: [0.22, 1, 0.36, 1] as const,
        };

  const showVideoEl =
    showVideo && !(reduceMotion && showImage);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={transition}
      className="group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border"
    >
      <div
        className={`relative aspect-[4/5] w-full ${hasBoth ? "cursor-pointer" : ""}`}
        onMouseEnter={() => {
          if (!hasBoth || coarsePointer) return;
          setRevealVideo(true);
        }}
        onMouseLeave={() => {
          if (!hasBoth || coarsePointer) return;
          setRevealVideo(false);
        }}
        onClick={() => {
          if (!hasBoth) return;
          if (coarsePointer) setRevealVideo((v) => !v);
        }}
        tabIndex={hasBoth ? 0 : undefined}
        role={hasBoth ? "button" : undefined}
        aria-label={
          hasBoth
            ? coarsePointer
              ? "Tap to play or hide video"
              : "Hover to play video"
            : undefined
        }
      >
        {showImage && p.image ? (
          <Image
            src={p.image}
            alt=""
            fill
            className={
              hasBoth && revealVideo
                ? "object-cover opacity-0 transition-opacity duration-300"
                : "object-cover transition-opacity duration-300"
            }
            sizes="(max-width: 640px) 100vw, 33vw"
            loading="lazy"
            unoptimized={p.image.startsWith("/uploads/")}
            onError={() => setImageFailed(true)}
          />
        ) : null}

        {showVideoEl ? (
          <video
            ref={videoRef}
            src={videoSrc!}
            className={
              hasBoth
                ? `absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-300 ${
                    revealVideo ? "opacity-100" : "pointer-events-none opacity-0"
                  }`
                : "absolute inset-0 h-full w-full object-cover"
            }
            muted
            loop
            playsInline
            autoPlay={!hasBoth}
            poster={!hasBoth && showImage && p.image ? p.image : undefined}
            onError={() => setVideoBroken(true)}
          />
        ) : null}

        {p.galleryCaption?.trim() ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-background/95 via-background/50 to-transparent px-3 pb-3 pt-10">
            <p className="text-center text-xs font-medium leading-snug text-foreground sm:text-sm">
              {p.galleryCaption.trim()}
            </p>
          </div>
        ) : null}

        {!showVideo && (!hasImage || imageFailed) ? (
          <div className="flex h-full min-h-[120px] items-center justify-center bg-muted/20 px-2 text-center text-xs text-muted">
            No media for this item
          </div>
        ) : null}

        {hasBoth ? (
          <div
            className={`pointer-events-none absolute left-2 top-2 z-[2] rounded-full bg-background/80 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted transition-opacity ${
              revealVideo ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {coarsePointer ? "Tap" : "Video"}
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
