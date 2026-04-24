"use client";

import { useEffect, useState } from "react";

export const SECTION_IDS = ["home", "works", "gallery", "certifications", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

function computeActiveSection(): SectionId {
  if (typeof window === "undefined") return "home";
  const scrollPos = window.scrollY + window.innerHeight * 0.28;
  let current: SectionId = "home";
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.offsetTop <= scrollPos) current = id;
  }
  return current;
}

export function useSectionActive() {
  const [active, setActive] = useState<SectionId>("home");

  useEffect(() => {
    const onScroll = () => setActive(computeActiveSection());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return active;
}
