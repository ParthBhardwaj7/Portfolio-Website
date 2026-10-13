"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { ArrowUpRight } from "lucide-react";
import type { ExperienceVM } from "@/lib/lab/types";

const TYPE_LABEL: Record<string, string> = {
  work: "Work",
  project: "Project",
  certification: "Certification",
  opensource: "Open Source",
  milestone: "Milestone",
};

export function ExperienceSection({ entries }: { entries: ExperienceVM[] }) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Progress line tracks scroll within this section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (entries.length === 0) return null;

  return (
    <section id="experience" className="relative py-24 sm:py-32" aria-label="Experience">
      <div className="container-x">
        <SectionHeading
          index="05"
          label="Experience"
          title="A timeline of systems I've built and shipped."
          description="Projects, milestones and learning — only real entries, straight from the portfolio database."
        />

        <div ref={ref} className="relative mt-16">
          {/* Progress line */}
          <motion.div
            className="absolute left-4 top-0 h-full w-px bg-line sm:left-6"
            aria-hidden
          />
          <motion.div
            className="absolute left-4 top-0 h-full w-px origin-top bg-copper sm:left-6"
            style={{ scaleY: lineScaleY }}
            aria-hidden
          />

          <div className="space-y-12">
            {entries.map((exp) => (
              <motion.article
                key={exp.id}
                variants={staggerParent(0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-15% 0px" }}
                className="relative pl-12 sm:pl-16"
              >
                {/* Node dot — plain wrapper keeps the centering translate;
                    the inner motion.div owns the entrance animation */}
                <div className="absolute left-4 top-2 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full border-2 border-copper bg-background sm:left-6">
                  <motion.div variants={fadeUp} className="flex h-full w-full items-center justify-center">
                    <span className="h-1 w-1 rounded-full bg-copper" />
                  </motion.div>
                </div>

                <motion.div variants={fadeUp} className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-sm text-copper">{exp.year}</span>
                  <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {TYPE_LABEL[exp.type] ?? exp.type}
                  </span>
                </motion.div>

                <motion.h3
                  variants={fadeUp}
                  className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl"
                >
                  {exp.title}
                </motion.h3>

                {exp.org && (
                  <motion.div
                    variants={fadeUp}
                    className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {exp.org}
                  </motion.div>
                )}

                <motion.p
                  variants={fadeUp}
                  className="mt-4 max-w-2xl whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  {exp.description}
                </motion.p>

                {exp.technologies.length > 0 && (
                  <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </motion.div>
                )}

                {exp.url && (
                  <motion.a
                    variants={fadeUp}
                    href={exp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-copper"
                  >
                    View link
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </motion.a>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
