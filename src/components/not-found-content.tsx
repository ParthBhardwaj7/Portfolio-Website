"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/** Space-separated words; each drops in sequence. Optional: NEXT_PUBLIC_NOT_FOUND_NAME */
function useNameWords(): string[] {
  return useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_NOT_FOUND_NAME?.trim() || "PARTH BHARDWAJ";
    const parts = raw.split(/\s+/).filter(Boolean);
    return parts.length ? parts : ["PARTH", "BHARDWAJ"];
  }, []);
}

export function NotFoundContent() {
  const nameWords = useNameWords();
  /** 1…100 — same value drives the % text above the bar and the bar fill */
  const [progress, setProgress] = useState(1);
  const dropStagger = 0.38;
  const nameDelay = 0.12;
  const subtitleDelay = nameDelay + nameWords.length * dropStagger + 0.15;

  useEffect(() => {
    const duration = 2800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const pct = t >= 1 ? 100 : Math.max(1, Math.ceil(t * 100));
      setProgress(pct);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-20">
        <div className="flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6">
          {nameWords.map((word, i) => (
            <div key={`${word}-${i}`} className="overflow-hidden py-1">
              <motion.span
                initial={{ y: -80, rotate: -2 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{
                  delay: nameDelay + i * dropStagger,
                  type: "spring",
                  damping: 16,
                  stiffness: 260,
                  mass: 0.85,
                }}
                className="inline-block font-display text-[clamp(2.5rem,12vw,5.5rem)] font-light uppercase leading-none tracking-[0.08em] text-foreground"
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: subtitleDelay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-center"
        >
          <p className="text-[0.7rem] uppercase tracking-[0.45em] text-muted sm:text-xs">
            ERROR 404
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: subtitleDelay + 0.2 }}
          className="mt-12"
        >
          <Link
            href="/"
            className="text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
        </motion.div>
      </div>

      <div className="w-full px-6 pb-10 pt-4 sm:px-10">
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted italic">Loading</span>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full border border-accent bg-accent/10 px-5 py-2.5 text-center text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-background sm:order-none sm:shrink-0"
            >
              Let&apos;s Connect
            </Link>
            <span className="font-display text-xl tabular-nums tracking-normal text-foreground sm:min-w-[4.5rem] sm:text-right">
              {progress}%
            </span>
          </div>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-lg overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
