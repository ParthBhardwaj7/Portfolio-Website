"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerParent, EASE_PREMIUM } from "@/lib/lab/motion";
import { X, Play } from "lucide-react";
import type { GalleryTileVM } from "@/lib/lab/types";

/**
 * Lab gallery — real screenshots and loops from the portfolio database.
 * Uniform, aligned grid: every tile is the same aspect ratio with its
 * caption in a footer bar below the media (never overlapping).
 */
export function GallerySection({ tiles }: { tiles: GalleryTileVM[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [active, setActive] = React.useState<GalleryTileVM | null>(null);

  // Escape closes the lightbox
  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  const items = tiles.filter((t) => t.image || t.videoUrl);
  if (items.length === 0) return null;

  return (
    <section id="lab" className="relative py-24 sm:py-32" aria-label="Lab gallery">
      <div className="container-x">
        <SectionHeading
          index="07"
          label="Lab"
          title="Frames from the workbench."
          description="Dashboards, deployments and interfaces — captured from the actual builds."
        />

        <motion.div
          ref={ref}
          variants={staggerParent(0.08)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <motion.button
              key={item.id}
              variants={fadeUp}
              onClick={() => setActive(item)}
              data-cursor="image"
              aria-label={`Open ${item.caption || item.projectTitle} in lightbox`}
              className="group overflow-hidden rounded-xl border border-line bg-surface-2 text-left transition-colors hover:border-copper/40"
            >
              {/* Media — uniform 16/10 crop, never overlaid */}
              <div className="relative aspect-[16/10] overflow-hidden">
                {item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  item.image && (
                    <Image
                      src={item.image}
                      alt={item.caption || item.projectTitle}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )
                )}
                {item.videoUrl && (
                  <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-copper backdrop-blur">
                    <Play className="h-2.5 w-2.5" /> Loop
                  </span>
                )}
              </div>

              {/* Caption footer — always below the media */}
              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-copper">
                    {item.projectTitle}
                  </div>
                  {item.caption && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.caption}
                    </div>
                  )}
                </div>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-copper">
                  View
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/85 p-4 backdrop-blur-xl sm:p-6"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || active.projectTitle}
        >
          <motion.div
            className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface-2"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE_PREMIUM }}
            onClick={(e) => e.stopPropagation()}
          >
            {active.videoUrl ? (
              <video
                src={active.videoUrl}
                muted
                loop
                playsInline
                autoPlay
                controls
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              active.image && (
                <Image
                  src={active.image}
                  alt={active.caption || active.projectTitle}
                  fill
                  sizes="(min-width: 768px) 896px, 95vw"
                  className="object-contain"
                />
              )
            )}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-background/80 to-transparent p-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-copper">
                  {active.projectTitle}
                </div>
                <h3 className="mt-1 font-display text-xl font-medium tracking-tight sm:text-2xl">
                  {active.caption || active.projectTitle}
                </h3>
              </div>
              <button
                onClick={() => setActive(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-background/60 hover:border-copper hover:text-copper"
                aria-label="Close"
                autoFocus
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
