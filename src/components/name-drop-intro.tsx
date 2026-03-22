"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export function useNameDropLoadingProgress() {
  const [progress, setProgress] = useState(1);
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
  return progress;
}

export function NameDropLoadingFooter({
  progress,
  className = "",
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={className}>
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
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

type NameDropIntroProps = {
  words: string[];
  subtitle: string;
  /** Shared with loading footer (one `useNameDropLoadingProgress()` per screen) */
  progress: number;
  showBackLink?: boolean;
  align?: "center" | "start";
  className?: string;
  hideLoadingFooter?: boolean;
};

export function NameDropIntro({
  words,
  subtitle,
  progress,
  showBackLink = false,
  align = "center",
  className = "",
  hideLoadingFooter = false,
}: NameDropIntroProps) {
  const dropStagger = 0.38;
  const nameDelay = 0.12;
  const subtitleDelay = nameDelay + words.length * dropStagger + 0.15;

  const isStart = align === "start";

  return (
    <div className={className}>
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-6 ${
          isStart ? "justify-start" : "justify-center"
        }`}
      >
        {words.map((word, i) => (
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
              className="inline-block font-display text-[clamp(2.15rem,9vw,4.5rem)] font-light uppercase leading-none tracking-[0.08em] text-foreground sm:tracking-[0.1em]"
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
        className={isStart ? "mt-6 text-left" : "mt-8 text-center"}
      >
        <p className="text-[0.7rem] uppercase tracking-[0.45em] text-muted sm:text-xs">{subtitle}</p>
      </motion.div>

      {showBackLink ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: subtitleDelay + 0.2 }}
          className={isStart ? "mt-8 text-left" : "mt-12 text-center"}
        >
          <Link
            href="/"
            className="text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
        </motion.div>
      ) : null}

      {!hideLoadingFooter ? (
        <div
          className={
            isStart ? "mt-10 w-full max-w-lg" : "mt-12 w-full px-0 sm:px-0"
          }
        >
          <NameDropLoadingFooter progress={progress} />
        </div>
      ) : null}
    </div>
  );
}
