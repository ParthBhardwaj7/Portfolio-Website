"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { cn } from "@/lib/lab/utils";

type SectionHeadingProps = {
  index: string;
  label: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  index,
  label,
  title,
  description,
  className,
}: SectionHeadingProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerParent(0.1)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn("flex flex-col gap-4", className)}
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span className="text-copper">{index}</span>
        <span className="h-px w-8 bg-line-strong" />
        <span>{label}</span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl"
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          variants={fadeUp}
          className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
