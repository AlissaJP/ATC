"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Notification (toast) — Cahier 7 §4. Auto-fermeture après `dureeMs`, action optionnelle (ex. Annuler).
export function Toast({
  message,
  actionLabel,
  onAction,
  onFermer,
  dureeMs = 5000,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onFermer: () => void;
  dureeMs?: number;
}) {
  useEffect(() => {
    const minuteur = setTimeout(onFermer, dureeMs);
    return () => clearTimeout(minuteur);
  }, [onFermer, dureeMs]);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 12, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-4 left-1/2 z-50 flex items-center gap-3 rounded-lg bg-texte-principal px-4 py-3 text-sm text-white shadow-lg"
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={(e) => {
            // Le toast peut être monté à l'intérieur d'un <Link> englobant (ProductCard, ProductListItem)
            // — sans ça, un clic ici déclencherait aussi la navigation native/le routage du parent.
            e.preventDefault();
            e.stopPropagation();
            onAction();
            onFermer();
          }}
          className="font-semibold text-primaire-clair hover:underline"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        aria-label="Fermer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFermer();
        }}
        className="text-white/70 hover:text-white"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
