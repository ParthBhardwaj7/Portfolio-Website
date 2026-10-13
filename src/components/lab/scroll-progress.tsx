"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/** Thin copper progress bar fixed to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[90] h-px origin-left bg-copper"
      style={{ scaleX }}
    />
  );
}
