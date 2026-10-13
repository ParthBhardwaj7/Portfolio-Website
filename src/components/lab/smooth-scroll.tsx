"use client";

import * as React from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/lab/hooks";

/**
 * Lenis smooth-scroll provider, integrated with requestAnimationFrame.
 * Respects reduced-motion (skips Lenis entirely).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Hash-link smooth scroll
    const onHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.4 });
      }
    };
    document.addEventListener("click", onHashClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onHashClick);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
