"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerParent, EASE_PREMIUM } from "@/lib/lab/motion";
import { ArrowUpRight } from "lucide-react";

export function AboutSection({
  paragraphs,
  profileImage,
  exploringLabels,
}: {
  paragraphs: string[];
  profileImage: string | null;
  exploringLabels: string[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <section id="about" className="relative py-24 sm:py-32" aria-label="About">
      <div className="container-x">
        <SectionHeading
          index="01"
          label="About"
          title="Building scalable systems, designed to fail gracefully."
        />

        <div ref={ref} className="mt-16 grid items-start gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          {/* Bio */}
          <motion.div
            variants={staggerParent(0.12)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-6"
          >
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                {p}
              </motion.p>
            ))}

            {exploringLabels.length > 0 && (
              <motion.div variants={fadeUp} className="pt-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
                  Currently exploring
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {exploringLabels.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line px-3 py-1 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Profile card — technical frame around the real photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: EASE_PREMIUM, delay: 0.2 }}
            className="relative mx-auto w-full max-w-sm md:mx-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-surface-2">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Portrait of Parth Bhardwaj"
                  fill
                  sizes="(min-width: 768px) 384px, 90vw"
                  className="object-cover"
                />
              ) : (
                <div className="bg-grid absolute inset-0 opacity-60" />
              )}
              {/* Legibility scrims: darken top and bottom bands over the photo */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/85 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="bg-grid absolute inset-0 opacity-15" />

              <div className="absolute inset-0 p-5">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-sm">
                      PROFILE.SYS
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-1 font-mono text-[10px] text-emerald-500 backdrop-blur-sm">
                      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-[10px]">
                    {["Backend", "AI", "Cloud"].map((f) => (
                      <div
                        key={f}
                        className="flex items-center justify-between border-t border-line pt-2 text-foreground/90"
                      >
                        <span>{f.toUpperCase()}</span>
                        <ArrowUpRight className="h-3 w-3 text-copper" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Corner brackets */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute left-3 top-3 h-4 w-4 border-l border-t border-copper/60" />
                <div className="absolute right-3 top-3 h-4 w-4 border-r border-t border-copper/60" />
                <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-copper/60" />
                <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-copper/60" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
