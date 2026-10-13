"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { ProjectModal } from "./project-modal";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { ArrowUpRight, ArrowDownRight, Play } from "lucide-react";
import { cn } from "@/lib/lab/utils";
import type { ProjectVM } from "@/lib/lab/types";

export function ProjectsSection({ projects }: { projects: ProjectVM[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [active, setActive] = React.useState<ProjectVM | null>(null);

  if (projects.length === 0) return null;

  return (
    <section id="work" className="relative py-24 sm:py-32" aria-label="Selected projects">
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Work"
          title="Selected projects — engineered to be operated, not just shipped."
          description="Monitoring stacks, LLM-driven tooling and infrastructure. Each project below is real, with the problem, solution and architecture explained."
        />

        <motion.div
          ref={ref}
          variants={staggerParent(0.12)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 grid gap-4 md:grid-cols-2"
        >
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              total={projects.length}
              onOpen={() => setActive(p)}
            />
          ))}
        </motion.div>
      </div>

      <ProjectModal project={active} onOpenChange={setActive} />
    </section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  onOpen,
}: {
  project: ProjectVM;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(sy, [-50, 50], [5, -5]);
  const rotateY = useTransform(sx, [-50, 50], [-5, 5]);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(e.clientX - (r.left + r.width / 2));
    y.set(e.clientY - (r.top + r.height / 2));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const tech = project.techStack.slice(0, 4);

  return (
    <motion.button
      ref={ref}
      variants={fadeUp}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onOpen}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1200 }}
      data-cursor="project"
      aria-haspopup="dialog"
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/50 p-6 text-left transition-colors",
        "hover:border-copper/40 sm:p-8"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-copper">
          {project.featured ? "FEATURED" : "PROJECT"}
        </span>
      </div>

      {/* Visual block — real cover media from the database */}
      <div className="relative my-6 aspect-[16/9] overflow-hidden rounded-lg border border-line bg-surface-2">
        <div className="bg-grid absolute inset-0 opacity-40" />
        {project.videoUrl ? (
          <video
            src={project.videoUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} interface`}
            fill
            sizes="(min-width: 768px) 560px, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl font-medium tracking-tight text-copper/60">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {project.videoUrl && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-copper backdrop-blur">
            <Play className="h-2.5 w-2.5" /> Loop
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
        {project.title}
      </h3>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      {/* Tech + CTA — pinned to the card bottom so rows stay aligned */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-foreground">
        <span>View case study</span>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>

      {/* Corner accent */}
      <div className="pointer-events-none absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowDownRight className="h-4 w-4 text-copper" />
      </div>
    </motion.button>
  );
}
