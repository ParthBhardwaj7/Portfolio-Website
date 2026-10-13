"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerParent, EASE_PREMIUM } from "@/lib/lab/motion";
import { cn } from "@/lib/lab/utils";
import type { SkillCategoryVM } from "@/lib/lab/types";

export function TechStack({ categories }: { categories: SkillCategoryVM[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  if (categories.length === 0) return null;

  return (
    <section id="stack" className="relative py-24 sm:py-32" aria-label="Tech stack">
      <div className="container-x">
        <SectionHeading
          index="04"
          label="Stack"
          title="Technologies I reach for, by domain."
          description="No fake proficiency bars — just an honest inventory of what I build with, grouped by problem domain."
        />

        <motion.div
          ref={ref}
          variants={staggerParent(0.08)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={fadeUp}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface/50 p-6 transition-colors",
                "hover:border-copper/40 hover:bg-surface"
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-copper">
                  {cat.items.length} tools
                </span>
              </div>

              <h3 className="mt-6 font-display text-2xl font-medium tracking-tight">{cat.title}</h3>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {cat.items.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-copper hover:text-copper"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Hover accent */}
              <motion.div
                className="absolute bottom-0 left-0 h-px w-full origin-left bg-copper"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          ))}
        </motion.div>

        <OrbitalTech categories={categories} />
      </div>
    </section>
  );
}

/**
 * Orbital visualization — decorative. Core skills orbit a central anchor.
 * Positions are deterministic (no Math.random during render).
 */
function OrbitalTech({ categories }: { categories: SkillCategoryVM[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [active, setActive] = React.useState<{ name: string; category: string } | null>(null);

  if (categories.length === 0 || categories.every((c) => c.items.length === 0)) return null;

  // Distribute every real skill from the DB across three orbits:
  // core (languages + databases) → cloud & DevOps → tooling + AI.
  const assigned = new Set<string>();
  const pick = (re: RegExp) => {
    const out: { name: string; category: string }[] = [];
    for (const c of categories) {
      if (!re.test(c.title)) continue;
      for (const name of c.items) {
        if (assigned.has(name)) continue;
        assigned.add(name);
        out.push({ name, category: c.title });
      }
    }
    return out;
  };

  const ringDefs = [
    { radius: 23, offset: -90, items: pick(/programming|language|database/i) },
    { radius: 36, offset: -72, items: pick(/cloud|devops|deploy|infra/i) },
    { radius: 47.5, offset: -80, items: pick(/./) }, // everything else
  ].filter((r) => r.items.length > 0);

  const techs = ringDefs.flatMap((ring) =>
    ring.items.map((item, i) => ({
      ...item,
      radius: ring.radius,
      angle: ring.offset + (360 / ring.items.length) * i,
    }))
  );

  const activeName = active?.name ?? null;

  return (
    <div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, ease: EASE_PREMIUM, delay: 0.3 }}
        className="relative mx-auto mt-16 aspect-square w-full max-w-2xl lg:max-w-3xl"
      >
        {/* Orbit rings */}
        {ringDefs.map((ring) => (
          <div
            key={ring.radius}
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full border border-line"
            style={{
              width: `${ring.radius * 2}%`,
              height: `${ring.radius * 2}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Center — centering lives in framer's style so the scale
            animation can't override the translate */}
        <motion.div
          className={cn(
            "absolute left-1/2 top-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-copper font-mono text-sm font-bold text-background transition-shadow duration-300 sm:h-20 sm:w-20 sm:text-base",
            activeName && "shadow-[0_0_60px_-8px_var(--copper)]"
          )}
          style={{ x: "-50%", y: "-50%" }}
          animate={{ scale: activeName ? 1.14 : [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: activeName ? 0 : Infinity, ease: "easeInOut" }}
        >
          PB
        </motion.div>

        {/* Connection lines — the hovered node's line lights up and flows */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          {techs.map((t) => {
            const x = 50 + t.radius * Math.cos((t.angle * Math.PI) / 180);
            const y = 50 + t.radius * Math.sin((t.angle * Math.PI) / 180);
            const isActive = activeName === t.name;
            return (
              <line
                key={`line-${t.name}`}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="var(--copper)"
                strokeWidth={isActive ? 0.55 : 0.2}
                opacity={activeName === null ? 0.3 : isActive ? 1 : 0.08}
                strokeDasharray="0.5 0.5"
                className={cn("transition-all duration-300", isActive && "dash-flow")}
              />
            );
          })}
        </svg>

        {/* Tech nodes */}
        {techs.map((t, i) => {
          const x = 50 + t.radius * Math.cos((t.angle * Math.PI) / 180);
          const y = 50 + t.radius * Math.sin((t.angle * Math.PI) / 180);
          const isActive = activeName === t.name;
          return (
            <div
              key={t.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%`, zIndex: isActive ? 20 : 10 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: EASE_PREMIUM }}
              >
                <motion.button
                  type="button"
                  onMouseEnter={() => setActive({ name: t.name, category: t.category })}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive({ name: t.name, category: t.category })}
                  onBlur={() => setActive(null)}
                  aria-label={`${t.name} — ${t.category}`}
                  className={cn(
                    "inline-flex cursor-pointer items-center whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors duration-300 sm:px-3 sm:text-[10px]",
                    isActive
                      ? "border-copper bg-copper/10 text-copper shadow-[0_0_24px_-6px_var(--copper)]"
                      : "border-line bg-surface text-muted-foreground"
                  )}
                  animate={{ y: [0, -4, 0], scale: isActive ? 1.14 : 1 }}
                  transition={{
                    y: {
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    },
                    scale: { type: "spring", stiffness: 320, damping: 22 },
                  }}
                >
                  {t.name}
                </motion.button>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Readout — what the visitor is pointing at */}
      <div className="mx-auto mt-8 w-full max-w-2xl px-4 lg:max-w-3xl">
        <div
          aria-live="polite"
          className="flex min-h-10 items-center justify-center rounded-lg border border-line bg-surface/50 px-4 py-2 text-center font-mono text-xs"
        >
          {active ? (
            <span>
              <span className="text-foreground">{active.name}</span>
              <span className="text-muted-foreground"> · {active.category}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{"// hover a node to inspect"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
