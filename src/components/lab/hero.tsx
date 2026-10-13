"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { EASE_PREMIUM, charRevealChild, charRevealParent } from "@/lib/lab/motion";

// Heavy 3D layer — client-only, code-split, rendered behind hero content
const HeroScene = dynamic(
  () => import("./three/hero-scene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null }
);

const STATUS_ROWS = [
  { label: "SYSTEM", value: "ONLINE", dot: true },
  { label: "FOCUS", value: "BACKEND / AI / CLOUD" },
  { label: "LOCATION", value: "INDIA" },
];

export function Hero({
  heroLines,
  supportLine,
  eyebrow,
  availability,
}: {
  heroLines: string[];
  supportLine: string;
  eyebrow: string;
  availability: string;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  // Scene recedes as the visitor scrolls away from the hero
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.85], [0.75, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* 3D constellation — behind content */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ opacity: sceneOpacity, scale: sceneScale }}
        aria-hidden
      >
        <HeroScene />
      </motion.div>

      <div className="container-x relative z-10">
        {/* Eyebrow */}
        <motion.div
          className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-copper" />
          <span>{eyebrow}</span>
        </motion.div>

        {/* Hero typography — masked reveal */}
        <motion.h1
          variants={charRevealParent(0.06)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="font-display text-[clamp(3rem,11vw,9rem)] font-medium leading-[0.95] tracking-tight"
        >
          {heroLines.map((line, i) => (
            <span key={i} className="mask-reveal block">
              <motion.span variants={charRevealChild} className="block">
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Support line */}
        <motion.p
          className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE_PREMIUM }}
        >
          {supportLine}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.75, ease: EASE_PREMIUM }}
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-copper"
            data-cursor="link"
          >
            View Work
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-copper hover:text-copper"
            data-cursor="link"
          >
            Let&apos;s Talk
          </a>
        </motion.div>
      </div>

      {/* Status panel — bottom-right */}
      <motion.div
        className="absolute bottom-8 right-4 z-10 hidden w-64 rounded-2xl border border-line bg-surface/50 p-4 backdrop-blur-md sm:block lg:right-8 lg:w-72"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1, ease: EASE_PREMIUM }}
      >
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-copper">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {availability}
        </div>
        <div className="space-y-2 font-mono text-[10px]">
          {STATUS_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 border-t border-line pt-2"
            >
              <span className="uppercase tracking-wider text-muted-foreground">{row.label}</span>
              <span className="flex items-center gap-1.5 text-foreground">
                {row.dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator — bottom-left */}
      <motion.div
        className="absolute bottom-8 left-4 z-10 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground lg:left-8"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span>Scroll to explore</span>
        <motion.span
          className="h-8 w-px bg-gradient-to-b from-copper to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}
