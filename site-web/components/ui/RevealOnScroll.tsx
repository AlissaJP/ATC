"use client";

// Raffinement Design — micro-animation de transition entre sections de page : fondu + léger glissement
// au défilement. whileInView (Framer Motion) ne se déclenche qu'une fois par section (once: true) pour
// ne pas rejouer l'animation à chaque va-et-vient de scroll.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function RevealOnScroll({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
