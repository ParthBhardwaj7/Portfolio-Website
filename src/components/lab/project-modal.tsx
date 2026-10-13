"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { type ProjectVM } from "@/lib/lab/types";
import { X, ExternalLink, FileText } from "lucide-react";
import { GithubIcon } from "./icons";
import { fadeUp, staggerParent } from "@/lib/lab/motion";

export function ProjectModal({
  project,
  onOpenChange,
}: {
  project: ProjectVM | null;
  onOpenChange: (p: ProjectVM | null) => void;
}) {
  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onOpenChange(null)}>
      <DialogContent
        className="max-h-[92vh] overflow-hidden border-line bg-background p-0 sm:max-w-4xl"
        hideClose
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{project?.title ?? "Project"}</DialogTitle>
        {project && <ProjectBody project={project} onClose={() => onOpenChange(null)} />}
      </DialogContent>
    </Dialog>
  );
}

function ProjectBody({ project, onClose }: { project: ProjectVM; onClose: () => void }) {
  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-line p-6 sm:p-8">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
              <span className="text-copper">{project.featured ? "FEATURED" : "PROJECT"}</span>
              <span className="h-px w-8 bg-line-strong" />
              <span className="uppercase tracking-wider">
                {project.techStack.slice(0, 2).join(" · ") || "Case study"}
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line hover:border-copper hover:text-copper"
            aria-label="Close"
            autoFocus
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-10 p-6 sm:p-8">
          {/* Cover media */}
          {(project.image || project.videoUrl) && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line bg-surface-2">
              {project.videoUrl ? (
                <video
                  src={project.videoUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  controls
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                project.image && (
                  <Image
                    src={project.image}
                    alt={`${project.title} cover`}
                    fill
                    sizes="(min-width: 768px) 896px, 90vw"
                    className="object-cover"
                  />
                )
              )}
            </div>
          )}

          {/* Overview */}
          <Section title="Overview">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {project.description}
            </p>
          </Section>

          {/* Problem / Solution */}
          {project.problem && (
            <Section title="Problem">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {project.problem}
              </p>
            </Section>
          )}
          {project.solution && (
            <Section title="Solution">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {project.solution}
              </p>
            </Section>
          )}

          {/* Architecture */}
          {project.architecture && (
            <Section title="Architecture">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {project.architecture}
              </p>
            </Section>
          )}

          {/* Gallery */}
          {project.gallery.length > 0 && (
            <Section title="Screenshots">
              <div className="grid gap-3 sm:grid-cols-2">
                {project.gallery.map((img) => (
                  <figure
                    key={img.id}
                    className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-surface-2"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `${project.title} screenshot`}
                      fill
                      sizes="(min-width: 640px) 400px, 90vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {img.caption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 font-mono text-[10px] text-muted-foreground">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </Section>
          )}

          {/* Technologies */}
          {project.techStack.length > 0 && (
            <Section title="Technologies">
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Links */}
          {(project.liveUrl || project.link || project.slug) && (
            <Section title="Links">
              <div className="flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-copper hover:text-copper"
                  >
                    <ExternalLink className="h-4 w-4" /> Visit site
                  </a>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-copper hover:text-copper"
                  >
                    <GithubIcon className="h-4 w-4" /> View source
                  </a>
                )}
                {project.slug && (
                  <a
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-copper"
                  >
                    <FileText className="h-4 w-4" /> Full case study
                  </a>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={staggerParent(0.08)} initial="hidden" animate="visible">
      <motion.h3
        variants={fadeUp}
        className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-copper"
      >
        <span className="h-px w-6 bg-copper" />
        {title}
      </motion.h3>
      <motion.div variants={fadeUp}>{children}</motion.div>
    </motion.div>
  );
}
