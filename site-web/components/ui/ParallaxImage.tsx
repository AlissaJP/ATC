"use client";

// Raffinement Design (#20) — parallax discret : la photo défile légèrement plus lentement/rapidement que
// le reste de la section, via useScroll/useTransform (scroll-driven, pas d'écouteur natif coûteux). La
// photo dépasse volontairement son cadre de `amplitude` px en haut/bas (compensé par overflow-hidden sur
// le conteneur) pour ne jamais laisser de bord vide pendant le déplacement.
// MotionConfig (app/layout.tsx) ne neutralise que les animations déclaratives (animate/whileHover/…) — un
// MotionValue piloté par le scroll comme ici doit vérifier prefers-reduced-motion explicitement.
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function ParallaxImage({ children, amplitude = 24 }: { children: ReactNode; amplitude?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefereMouvementReduit = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amplitude, amplitude]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div
        style={{ position: "absolute", left: 0, right: 0, top: -amplitude, bottom: -amplitude, y: prefereMouvementReduit ? 0 : y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
