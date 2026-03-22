"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  /** ms per character */
  speed?: number;
  className?: string;
};

const bodyClass =
  "text-base leading-[1.75] text-muted sm:text-lg sm:leading-[1.8]";

/**
 * Reserves layout for the full string up front so the hero grid doesn’t grow
 * while typing (left column / name stay stable).
 */
export function AboutTypewriter({ text, speed = 22, className = "" }: Props) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <div className={`relative isolate min-w-0 ${className}`}>
      {/* Invisible full copy: fixes height for final wrap so nothing below jumps */}
      <p
        className={`pointer-events-none select-none text-transparent ${bodyClass}`}
        aria-hidden
      >
        {text || "\u00a0"}
      </p>
      <p className={`absolute left-0 top-0 w-full min-w-0 ${bodyClass}`}>
        <span className="text-muted">{shown}</span>
        {!done ? (
          <span
            className="ml-0.5 inline-block h-4 w-px animate-pulse bg-accent align-middle sm:h-5"
            aria-hidden
          />
        ) : null}
      </p>
    </div>
  );
}
