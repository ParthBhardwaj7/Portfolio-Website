"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Compact control — matches minimal portfolio UI (not a second “cursor”) */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-flex h-11 w-11 rounded-full border border-border/80 bg-background/80" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/90 bg-background/90 text-base leading-none text-muted shadow-sm transition-colors hover:border-accent/50 hover:text-foreground dark:border-white/15 dark:bg-white/5"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☾" : "☀"}
    </motion.button>
  );
}
