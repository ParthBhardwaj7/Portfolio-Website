"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Smooth ease — slow, premium feel */
const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Extra delay after entering view (stagger between sections) */
  delay?: number;
};

/**
 * Major page section: scroll-snap align + enter animation (fade, rise, subtle scale)
 * so scrolling Home → Works → Gallery → Contact feels like opening the next “page”.
 */
export function ScrollSection({ id, className = "", children, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0.2 : 1.18;

  return (
    <motion.section
      id={id}
      className={`snap-start scroll-mt-32 lg:scroll-mt-28 ${className}`}
      initial={{ opacity: 0, y: 52, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -18% 0px", amount: 0.14 }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.section>
  );
}
