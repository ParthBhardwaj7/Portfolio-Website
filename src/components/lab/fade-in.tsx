"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/lab/motion";

/** Light client wrapper — fades + lifts children into view once. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE_PREMIUM }}
    >
      {children}
    </motion.div>
  );
}
