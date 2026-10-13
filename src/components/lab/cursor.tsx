"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIsTouchDevice, useReducedMotion } from "@/lib/lab/hooks";

type CursorVariant = "default" | "link" | "project" | "image" | "view" | "open" | "hidden";

type CursorContext = {
  variant: CursorVariant;
  label?: string;
  set: (v: CursorVariant, label?: string) => void;
};

const Ctx = React.createContext<CursorContext>({
  variant: "default",
  set: () => {},
});

export function useCursor() {
  return React.useContext(Ctx);
}

const VARIANT_LABEL: Record<CursorVariant, string | undefined> = {
  default: undefined,
  link: undefined,
  project: "VIEW PROJECT",
  image: "VIEW",
  view: "VIEW",
  open: "OPEN",
  hidden: undefined,
};

/**
 * Decorative cursor layer — desktop only, disabled for touch + reduced motion.
 * A small copper dot (instant) + larger ring (spring-following) that morphs
 * into a labelled chip over interactive elements. The native cursor stays
 * visible for accessibility.
 */
export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = React.useState<CursorVariant>("default");
  const [label, setLabel] = React.useState<string | undefined>();
  const touch = useIsTouchDevice();
  const reduced = useReducedMotion();
  const enabled = !touch && !reduced;

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 380, damping: 28, mass: 0.4 });
  const ringY = useSpring(dotY, { stiffness: 380, damping: 28, mass: 0.4 });

  const set = React.useCallback((v: CursorVariant, l?: string) => {
    setVariant(v);
    setLabel(l ?? VARIANT_LABEL[v]);
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, dotX, dotY]);

  // Auto-detect interactive elements via mouseover
  React.useEffect(() => {
    if (!enabled) return;
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest(
        'a, button, [role="button"], [data-cursor]'
      ) as HTMLElement | null;
      if (interactive) {
        const c = interactive.getAttribute("data-cursor") as CursorVariant | null;
        const l = interactive.getAttribute("data-cursor-label") ?? undefined;
        set(c ?? "link", l);
      } else {
        set("default");
      }
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => document.removeEventListener("mouseover", onOver);
  }, [enabled, set]);

  return (
    <Ctx.Provider value={{ variant, label, set }}>
      {children}
      {enabled && (
        <>
          {/* Outer ring */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center"
            style={{ x: ringX, y: ringY }}
          >
            <motion.div
              className="flex items-center justify-center rounded-full border border-copper/60"
              animate={{
                width: variant === "default" ? 36 : 64,
                height: variant === "default" ? 36 : 64,
                opacity: variant === "hidden" ? 0 : 1,
                backgroundColor:
                  variant === "default" ? "rgba(217,119,87,0)" : "rgba(217,119,87,0.08)",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{ translateX: "-50%", translateY: "-50%" }}
            >
              {label && (
                <span className="px-2 text-center font-mono text-[9px] uppercase tracking-[0.15em] text-copper">
                  {label}
                </span>
              )}
            </motion.div>
          </motion.div>
          {/* Inner dot */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-copper"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
            animate={{ opacity: variant === "default" ? 1 : 0 }}
          />
        </>
      )}
    </Ctx.Provider>
  );
}
