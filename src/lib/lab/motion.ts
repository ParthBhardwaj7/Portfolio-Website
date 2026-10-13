/**
 * Motion utilities — shared Framer Motion variants + easing.
 * Centralized so motion stays consistent across the site.
 */
import type { Variants } from "framer-motion";

export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const; // smooth "expo-out"

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_PREMIUM } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_PREMIUM },
  },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const charRevealParent = (stagger = 0.04): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

export const charRevealChild: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

export const wordRevealChild: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};
