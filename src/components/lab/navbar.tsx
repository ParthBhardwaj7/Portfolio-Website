"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ArrowUpRight, Command } from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useActiveSection, useScrollDirection } from "@/lib/lab/hooks";
import { cn } from "@/lib/lab/utils";
import { MobileMenu } from "./mobile-menu";

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "work", label: "Work", href: "#work" },
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "stack", label: "Stack", href: "#stack" },
  { id: "lab", label: "Lab", href: "#lab" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export function Navbar({
  shortName,
  initials,
}: {
  shortName: string;
  initials: string;
}) {
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { dir, y } = useScrollDirection();
  const active = useActiveSection(NAV_ITEMS.map((n) => n.id));

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    setHidden(y > 240 && dir === "down" && !mobileOpen);
    setScrolled(y > 24);
  }, [dir, y, mobileOpen]);

  // Lock body scroll when mobile menu open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          aria-label="Primary"
          className={cn(
            "flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500",
            scrolled
              ? "glass shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]"
              : "border border-transparent bg-transparent"
          )}
        >
          {/* Logo / initials */}
          <a href="#top" className="group flex items-center gap-2 rounded-full px-3 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-copper font-mono text-[10px] font-bold text-background">
              {initials}
            </span>
            <span className="font-display text-sm font-medium tracking-tight">{shortName}</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="group relative rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span
                  className={cn(
                    "relative z-10 transition-colors",
                    active === item.id && "text-foreground"
                  )}
                >
                  {item.label}
                </span>
                {active === item.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-copper/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1">
            {/* Command palette hint — desktop */}
            <button
              onClick={() =>
                document.dispatchEvent(new CustomEvent("open-command-palette"))
              }
              className="hidden h-9 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-copper hover:text-copper md:flex"
              aria-label="Open command palette"
            >
              <Command className="h-3 w-3" />
              K
            </button>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-copper/10 hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* CTA — desktop */}
            <a
              href="#contact"
              className="ml-1 hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-copper sm:inline-flex"
            >
              Contact
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            shortName={shortName}
            initials={initials}
          />
        )}
      </AnimatePresence>
    </>
  );
}
