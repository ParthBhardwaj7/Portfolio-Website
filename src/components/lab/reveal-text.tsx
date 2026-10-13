"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { charRevealChild, charRevealParent, wordRevealChild } from "@/lib/lab/motion";
import { cn } from "@/lib/lab/utils";

type RevealTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  splitBy?: "char" | "word";
  delay?: number;
  stagger?: number;
};

/**
 * Masked text reveal — characters or words slide up from a clipped container.
 */
export function RevealText({
  text,
  as: Tag = "p",
  className,
  splitBy = "char",
  delay = 0,
  stagger,
}: RevealTextProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const effectiveStagger = stagger ?? (splitBy === "char" ? 0.025 : 0.08);

  const units =
    splitBy === "char"
      ? Array.from(text)
      : text.split(/(\s+)/).filter((s) => s.length > 0);

  return (
    <motion.div
      ref={ref}
      variants={charRevealParent(effectiveStagger)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delayChildren: delay }}
      className={cn("inline-block", className)}
    >
      {React.createElement(Tag as any, { className: "inline-block" },
        units.map((u, i) => (
          <span key={i} className="mask-reveal inline-block">
            <motion.span
              variants={splitBy === "char" ? charRevealChild : wordRevealChild}
              className="inline-block"
            >
              {u === " " ? "\u00A0" : u}
            </motion.span>
          </span>
        ))
      )}
    </motion.div>
  );
}
