"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioItem } from "@/components/portfolio-card";

function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

type MediaSlide =
  | { kind: "video"; src: string; poster: string | null }
  | { kind: "image"; src: string; caption: string | null };

function buildSlides(item: PortfolioItem): MediaSlide[] {
  const slides: MediaSlide[] = [];

  if (item.videoUrl?.trim()) {
    slides.push({
      kind: "video",
      src: item.videoUrl.trim(),
      poster: item.image ?? null,
    });
  }

  if (item.image) {
    slides.push({ kind: "image", src: item.image, caption: item.galleryCaption ?? null });
  }

  for (const img of item.images ?? []) {
    if (img.url) {
      slides.push({ kind: "image", src: img.url, caption: img.caption });
    }
  }

  return slides;
}

function MediaViewer({ slides, idx }: { slides: MediaSlide[]; idx: number }) {
  const slide = slides[idx];
  const [imageFailed, setImageFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setImageFailed(false);
    if (slide?.kind === "video") {
      videoRef.current?.load();
    }
  }, [slide, idx]);

  if (!slide) return null;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
      {slide.kind === "video" ? (
        <video
          ref={videoRef}
          src={slide.src}
          className="absolute inset-0 h-full w-full object-contain"
          controls
          muted
          loop
          playsInline
          poster={slide.poster ?? undefined}
        />
      ) : !imageFailed ? (
        <Image
          src={slide.src}
          alt={slide.caption ?? ""}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 700px"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted">
          Image unavailable
        </div>
      )}

      {slide.kind === "image" && slide.caption ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
          <p className="text-center text-xs text-white/80">{slide.caption}</p>
        </div>
      ) : null}
    </div>
  );
}

export function ProjectModal({
  item,
  onClose,
}: {
  item: PortfolioItem;
  onClose: () => void;
}) {
  useLockBodyScroll(true);
  const slides = buildSlides(item);
  const [idx, setIdx] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (slides.length > 1) {
        if (e.key === "ArrowRight") setIdx((i) => (i + 1) % slides.length);
        if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + slides.length) % slides.length);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, slides.length]);

  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx((i) => (i + 1) % slides.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground/60 backdrop-blur-sm hover:text-foreground transition-colors border border-border"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Media */}
        {slides.length > 0 ? (
          <div className="relative">
            <MediaViewer slides={slides} idx={idx} />

            {slides.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-border text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Previous image"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-border text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Next image"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIdx(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === idx ? "w-4 bg-white" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Content */}
        <div className="space-y-4 p-6">
          <h2 className="font-display text-xl tracking-tight">{item.title}</h2>
          <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
            {item.description}
          </p>

          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Visit project
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
