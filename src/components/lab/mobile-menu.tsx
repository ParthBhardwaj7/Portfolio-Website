"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./navbar";
import { EASE_PREMIUM } from "@/lib/lab/motion";

export function MobileMenu({
  open,
  onClose,
  shortName,
  initials,
}: {
  open: boolean;
  onClose: () => void;
  shortName: string;
  initials: string;
}) {
  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-background"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: EASE_PREMIUM }}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" />

      <div className="relative flex items-center justify-between px-4 pt-6">
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-copper font-mono text-[10px] font-bold text-background">
            {initials}
          </span>
          <span className="font-display text-sm font-medium tracking-tight">{shortName}</span>
        </span>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-foreground"
          aria-label="Close menu"
          autoFocus
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Mobile" className="relative mt-10 flex flex-col px-6">
        {NAV_ITEMS.map((item, i) => (
          <motion.a
            key={item.id}
            href={item.href}
            onClick={onClose}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: EASE_PREMIUM }}
            className="group flex items-baseline gap-4 border-b border-line py-5"
          >
            <span className="font-mono text-xs text-copper">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-display text-4xl font-medium tracking-tight transition-colors group-hover:text-copper">
              {item.label}
            </span>
          </motion.a>
        ))}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative mt-auto px-6 pb-10 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
      >
        Backend × AI × Cloud
      </motion.div>
    </motion.div>
  );
}
