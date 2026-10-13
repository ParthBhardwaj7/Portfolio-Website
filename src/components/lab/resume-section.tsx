"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { FileText, Download } from "lucide-react";
import type { ExperienceVM, CertificationVM, SkillCategoryVM } from "@/lib/lab/types";

/**
 * On-page résumé summary — everything pulled live from the database,
 * with links to the full PDF (served via /api/public/resume).
 */
export function ResumeSection({
  name,
  role,
  location,
  email,
  experience,
  certifications,
  skillCategories,
}: {
  name: string;
  role: string;
  location: string;
  email: string | null;
  experience: ExperienceVM[];
  certifications: CertificationVM[];
  skillCategories: SkillCategoryVM[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const milestones = experience.filter((e) => e.type === "milestone" || e.type === "work");

  return (
    <section id="resume" className="relative py-24 sm:py-32" aria-label="Resume">
      <div className="container-x">
        <SectionHeading
          index="08"
          label="Resume"
          title="A condensed, interactive résumé."
          description="The full PDF is available below — this is a quick on-page overview for recruiters and interviewers in a hurry."
        />

        <motion.div
          ref={ref}
          variants={staggerParent(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Profile */}
          <motion.div variants={fadeUp} className="rounded-xl border border-line bg-surface/50 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-copper">Profile</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="font-display text-lg font-medium">{name}</div>
              <div className="text-muted-foreground">{role}</div>
              <div className="text-muted-foreground">{location}</div>
              {email && <div className="pt-2 font-mono text-xs text-muted-foreground">{email}</div>}
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div variants={fadeUp} className="rounded-xl border border-line bg-surface/50 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-copper">Milestones</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {milestones.slice(0, 4).map((e) => (
                <li key={e.id} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
                  <div className="font-mono text-xs text-muted-foreground">{e.year}</div>
                  <div className="font-medium">{e.title}</div>
                </li>
              ))}
              {milestones.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  See the experience section for the full history.
                </li>
              )}
            </ul>
          </motion.div>

          {/* Certifications */}
          <motion.div variants={fadeUp} className="rounded-xl border border-line bg-surface/50 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
              Certifications
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {certifications.map((c) => (
                <li key={c.id} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.issuer}
                    {c.issueDate ? ` · ${c.issueDate}` : ""}
                  </div>
                </li>
              ))}
              {certifications.length === 0 && (
                <li className="text-sm text-muted-foreground">None listed yet.</li>
              )}
            </ul>
          </motion.div>

          {/* Skills summary */}
          <motion.div variants={fadeUp} className="rounded-xl border border-line bg-surface/50 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
              Technical Skills
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              {skillCategories.map((cat) => (
                <li key={cat.id} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
                  <div className="font-mono uppercase tracking-wider text-muted-foreground">
                    {cat.title}
                  </div>
                  <div className="text-foreground">{cat.items.slice(0, 4).join(" · ")}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-10 flex flex-wrap gap-3"
        >
          <a
            href="/resume"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-copper"
          >
            <FileText className="h-4 w-4" />
            View Resume
          </a>
          <a
            href="/api/public/resume?download=1"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-copper hover:text-copper"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </motion.div>
      </div>
    </section>
  );
}
