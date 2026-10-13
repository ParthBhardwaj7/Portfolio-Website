"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { GitPullRequest, Star, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "./icons";
import type { OssStats } from "@/lib/lab/types";

/**
 * "Building in public" strip — real GitHub activity via the server-side
 * snapshot (live API with a verified fallback). No fabricated numbers.
 */
export function OpenSourceStrip({ stats }: { stats: OssStats }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section id="opensource" className="relative py-24 sm:py-32" aria-label="Open source">
      <div className="container-x">
        <motion.div
          ref={ref}
          variants={staggerParent(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col gap-8"
        >
          <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-copper">03</span>
                <span className="h-px w-8 bg-line-strong" />
                <span>Open Source</span>
              </div>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
                Building in public, one merged PR at a time.
              </h2>
            </div>
            {stats.profile && (
              <a
                href={stats.profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-copper hover:text-copper"
              >
                <GithubIcon className="h-4 w-4" />@{stats.profile.login}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </motion.div>

          {/* Stats row — real numbers only */}
          <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={<GitPullRequest className="h-4 w-4 text-copper" />}
              value={String(stats.mergedPRs)}
              label="Merged pull requests"
            />
            <StatCard
              icon={<GithubIcon className="h-4 w-4 text-copper" />}
              value={stats.profile ? String(stats.profile.publicRepos) : "—"}
              label="Public repositories"
            />
            <StatCard
              icon={<Star className="h-4 w-4 text-copper" />}
              value={stats.profile ? String(stats.profile.followers) : "—"}
              label="GitHub followers"
            />
          </motion.div>

          {/* Repo chips */}
          {stats.topRepos.length > 0 && (
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {stats.topRepos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-copper/40 hover:text-foreground"
                >
                  <span className="font-medium text-foreground">{repo.name}</span>
                  {repo.language && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-copper">
                      {repo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                    <Star className="h-3 w-3" />
                    {repo.stars}
                  </span>
                </a>
              ))}
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70"
          >
            Source: {stats.source === "live" ? "GitHub API (live)" : "verified snapshot"} · merged PRs
            counted from public contribution data
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface/50 p-5 transition-colors hover:border-copper/40">
      <div className="flex items-center gap-2">{icon}</div>
      <div className="mt-4 font-display text-4xl font-medium tracking-tight">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
