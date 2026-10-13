"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import type { SocialLink } from "@/lib/lab/types";

export function Footer({
  name,
  tagline,
  bioShort,
  email,
  location,
  availability,
  socials,
}: {
  name: string;
  tagline: string;
  bioShort: string;
  email: string | null;
  location: string;
  availability: string;
  socials: SocialLink[];
}) {
  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-32 border-t border-line">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Identity */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
              {tagline}
            </span>
            <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">{name}</h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{bioShort}</p>
          </div>

          {/* Socials */}
          <nav aria-label="Social links" className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Connect
            </span>
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>{s.label}</span>
                <ArrowUp className="h-3 w-3 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>
            ))}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Email</span>
                <ArrowUp className="h-3 w-3 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>
            )}
          </nav>

          {/* Status */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <div className="flex items-center gap-2 text-sm">
              <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
              <span>{availability}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-mono text-xs">LOC</span> · {location}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <span className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {name}. All systems nominal.
          </span>
          <button
            onClick={backToTop}
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to top
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line transition-all group-hover:border-copper group-hover:text-copper">
              <ArrowUp className="h-3 w-3" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
