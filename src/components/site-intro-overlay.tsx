"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  NameDropIntro,
  NameDropLoadingFooter,
  useNameDropLoadingProgress,
} from "@/components/name-drop-intro";
import { siteConfig } from "@/lib/site-config";

const STORAGE_KEY = "portfolio_intro_seen";

function SiteIntroInner() {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const progress = useNameDropLoadingProgress();

  const words = useMemo(() => {
    const raw = siteConfig.heroName?.trim() || "Portfolio";
    const parts = raw.split(/\s+/).filter(Boolean);
    return parts.length ? parts : ["Portfolio"];
  }, []);

  const finish = useCallback(() => {
    setExiting(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
    window.setTimeout(() => setShow(false), 520);
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* ignore */
    }
    setShow(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (!show || reduceMotion) return;
    if (progress < 100) return;
    const t = window.setTimeout(() => finish(), 450);
    return () => window.clearTimeout(t);
  }, [show, progress, reduceMotion, finish]);

  useEffect(() => {
    if (!show) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="intro"
          role="dialog"
          aria-modal="true"
          aria-label="Site intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10050] flex flex-col bg-background text-foreground"
        >
          <button
            type="button"
            onClick={() => finish()}
            className="absolute right-4 top-4 z-[1] rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            Skip
          </button>

          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-20">
            <NameDropIntro
              words={words}
              subtitle={siteConfig.heroTitle}
              progress={progress}
              align="center"
              hideLoadingFooter
            />
          </div>

          <div className="w-full px-6 pb-10 pt-4 sm:px-10">
            <div className="mx-auto max-w-lg">
              <NameDropLoadingFooter progress={progress} />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Full-screen intro on `/` once per tab session, then normal site (hero unchanged). */
export function SiteIntroOverlay() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <SiteIntroInner />;
}
