"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { cn } from "@/lib/lab/utils";

type Principle = {
  id: string;
  label: string;
  title: string;
  description: string;
};

const PRINCIPLES: Principle[] = [
  {
    id: "build",
    label: "BUILD",
    title: "Ship with intent",
    description:
      "Code is a means to an end. I write Go and Python that does one thing well, with contracts that survive refactors and on-call rotations.",
  },
  {
    id: "design",
    label: "DESIGN",
    title: "Boundaries before features",
    description:
      "Good service boundaries make distributed systems tractable. I think in domain lines, data ownership and failure domains before I touch a keyboard.",
  },
  {
    id: "automate",
    label: "AUTOMATE",
    title: "Make toil impossible",
    description:
      "If a human does it twice, a machine should do it the third time. CI/CD, IaC, canary deploys — the boring automation that compounds.",
  },
  {
    id: "observe",
    label: "OBSERVE",
    title: "You can't fix what you can't see",
    description:
      "RED metrics, distributed traces, structured logs. Instrumentation is part of the feature, not an afterthought bolted on at 3am.",
  },
  {
    id: "scale",
    label: "SCALE",
    title: "Design for the next order of magnitude",
    description:
      "Systems that work at 1x often break at 10x. I architect for horizontal scale, idempotency and graceful degradation from day one.",
  },
];

export function EngineeringPhilosophy() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section className="relative py-24 sm:py-32" aria-label="Engineering philosophy">
      <div className="container-x">
        <motion.div
          ref={ref}
          variants={staggerParent(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="text-copper">/</span>
            <span>Engineering Philosophy</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-balance sm:text-4xl md:text-5xl"
          >
            Five principles I bring to every system I touch.
          </motion.h2>

          <motion.div variants={fadeUp} className="mt-12 grid gap-3 md:grid-cols-5">
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.id}
                variants={fadeUp}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-line bg-surface/50 p-5 transition-colors",
                  "hover:border-copper/40 hover:bg-surface"
                )}
              >
                <div className="font-mono text-[10px] text-muted-foreground">0{i + 1}</div>
                <div className="mt-8 font-display text-2xl font-medium tracking-tight">
                  {p.label}
                </div>
                <div className="mt-2 text-sm font-medium text-foreground">{p.title}</div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {p.description}
                </p>

                {/* Hover accent line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-px w-full origin-left bg-copper"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
