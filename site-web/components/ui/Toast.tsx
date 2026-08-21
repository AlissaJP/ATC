"use client";

import { useEffect } from "react";
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
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-texte-principal px-4 py-3 text-sm text-white shadow-lg"
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={() => {
            onAction();
            onFermer();
          }}
          className="font-semibold text-primaire-clair hover:underline"
        >
          {actionLabel}
        </button>
      )}
      <button type="button" aria-label="Fermer" onClick={onFermer} className="text-white/70 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
