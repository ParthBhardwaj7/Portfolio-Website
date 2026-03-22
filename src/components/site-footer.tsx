"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site-config";

const ease = [0.22, 1, 0.36, 1] as const;

export function SiteFooter() {
  const name = siteConfig.footerName;
  const year = new Date().getFullYear();
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0.2 }}
      transition={{ duration: 0.95, ease }}
      className="mt-20 border-t border-border pt-10 pb-8 text-[0.7rem] uppercase tracking-[0.15em] text-muted sm:text-xs"
    >
      <p>
        © {year} {name}
      </p>
    </motion.footer>
  );
}
