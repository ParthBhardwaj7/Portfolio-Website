"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  /** ms per character */
  speed?: number;
  className?: string;
};

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
    <p
      className={`text-base leading-[1.75] text-muted sm:text-lg sm:leading-[1.8] ${className}`}
    >
      {shown}
      {!done ? (
        <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-accent align-middle sm:h-5" aria-hidden />
      ) : null}
    </p>
  );
}
