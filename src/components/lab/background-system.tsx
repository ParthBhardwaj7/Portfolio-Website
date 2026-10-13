"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/lab/hooks";

/**
 * Layered background system — extremely subtle:
 * 1. Base color (set on body)
 * 2. Technical grid (radial-masked)
 * 3. Two slow-floating gradient blobs (copper-tinted)
 * 4. Noise overlay (in globals.css .noise-overlay on body)
 */
export function BackgroundSystem() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Grid */}
      <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" />

      {/* Floating blobs — copper-tinted, slow drift */}
      {!reduced && (
        <>
          <motion.div
            className="absolute -left-32 top-1/4 h-[36rem] w-[36rem] rounded-full opacity-[0.18] blur-[120px]"
            style={{
              background: "radial-gradient(circle, var(--copper) 0%, transparent 70%)",
            }}
            animate={{ x: [0, 60, 0], y: [0, 80, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-40 top-1/2 h-[40rem] w-[40rem] rounded-full opacity-[0.12] blur-[140px]"
            style={{
              background: "radial-gradient(circle, var(--copper-soft) 0%, transparent 70%)",
            }}
            animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
            transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Vignette — keep edges slightly darker for focus */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 35%, transparent 40%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
