"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/lab/motion";

/**
 * Short technical loading screen (1–1.4s). Skipped entirely when the
 * document has already loaded (cached visit) or reduced motion is set.
 */
export function LoadingScreen({ name, tagline }: { name: string; tagline: string }) {
  const [done, setDone] = React.useState(false);
  const [skip, setSkip] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (document.readyState === "complete") {
      setSkip(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSkip(true);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 120);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (skip) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: EASE_PREMIUM }}
        >
          <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h1
                className="font-display text-5xl font-medium tracking-tight sm:text-7xl"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE_PREMIUM, delay: 0.1 }}
              >
                {name}
              </motion.h1>
            </motion.div>

            <motion.div
              className="font-mono text-xs uppercase tracking-[0.3em] text-copper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {tagline}
            </motion.div>

            <div className="mt-4 flex w-56 items-center gap-3">
              <div className="relative h-px flex-1 bg-line-strong">
                <div className="absolute inset-y-0 left-0 bg-copper" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {String(progress).padStart(3, "0")}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
