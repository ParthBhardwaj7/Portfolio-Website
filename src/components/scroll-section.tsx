"use client";

import { motion } from "framer-motion";

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
 * Full-width section that fades and rises in slowly when scrolled into view.
 */
export function ScrollSection({ id, className, children, delay = 0 }: Props) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px", amount: 0.08 }}
      transition={{ duration: 1.05, delay, ease }}
    >
      {children}
    </motion.section>
  );
}
