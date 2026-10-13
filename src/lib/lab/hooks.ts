"use client";

import * as React from "react";

/** True when the user prefers reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** True when the device is touch-primary (no fine pointer). */
export function useIsTouchDevice(): boolean {
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return touch;
}

/** Tracks scroll position + direction (rAF-throttled). */
export function useScrollDirection() {
  const [dir, setDir] = React.useState<"up" | "down">("up");
  const [y, setY] = React.useState(0);
  const dirRef = React.useRef<"up" | "down">("up");
  React.useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cur = window.scrollY;
        if (cur > last + 4) dirRef.current = "down";
        else if (cur < last - 4) dirRef.current = "up";
        setDir(dirRef.current);
        setY(cur);
        last = cur;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { dir, y };
}

/**
 * Intersection-observer based visibility hook — used to pause heavy
 * animations (3D, etc.) when off-screen.
 */
export function useElementInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
      ...options,
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, inView };
}

/**
 * Tracks the active section id based on scroll position.
 * Used by the navbar to highlight the current section.
 */
export function useActiveSection(ids: string[]) {
  const key = ids.join(",");
  const [active, setActive] = React.useState<string>(ids[0] ?? "");
  React.useEffect(() => {
    const list = key.split(",").filter(Boolean);
    const observers: IntersectionObserver[] = [];
    const visibleMap = new Map<string, number>();
    list.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            visibleMap.set(id, e.isIntersecting ? e.intersectionRatio : 0);
          });
          let best = list[0] ?? "";
          let bestRatio = 0;
          visibleMap.forEach((ratio, sid) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = sid;
            }
          });
          setActive(best);
        },
        { threshold: [0.1, 0.25, 0.5, 0.75] }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [key]);
  return active;
}
