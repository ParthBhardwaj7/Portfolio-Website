"use client";

import * as React from "react";

/**
 * Two-row infinite marquee — opposite directions, driven by the real
 * skill inventory from the database. Pauses on hover. Pure CSS animation.
 */
export function SkillsMarquee({ labels }: { labels: string[] }) {
  const row1 = [...labels, ...labels];
  const row2 = [...labels.slice().reverse(), ...labels.slice().reverse()];

  if (labels.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden border-y border-line py-10"
      aria-label="Technologies overview"
    >
      <div className="group relative flex flex-col gap-4 [perspective:1000px]">
        {/* Row 1 — left to right */}
        <div
          className="flex gap-4 whitespace-nowrap will-change-transform [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          style={{ ["--marquee-duration" as string]: "40s" }}
        >
          <div className="animate-marquee flex shrink-0 gap-4 group-hover:[animation-play-state:paused]">
            {row1.map((s, i) => (
              <MarqueeItem key={`r1-${i}`} text={s} />
            ))}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div
          className="flex gap-4 whitespace-nowrap will-change-transform [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          style={{ ["--marquee-duration" as string]: "50s" }}
        >
          <div className="animate-marquee-reverse flex shrink-0 gap-4 group-hover:[animation-play-state:paused]">
            {row2.map((s, i) => (
              <MarqueeItem key={`r2-${i}`} text={s} variant="muted" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeItem({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "default" | "muted";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-4 font-display text-3xl font-medium tracking-tight sm:text-5xl " +
        (variant === "muted" ? "text-muted-foreground/40" : "text-foreground")
      }
    >
      {text}
      <span className="text-copper">/</span>
    </span>
  );
}
