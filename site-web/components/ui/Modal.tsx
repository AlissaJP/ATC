"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Modale réutilisable — Cahier 7 §4 (fond assombri, fermeture par Échap/clic extérieur).
export function Modal({
  titre,
  onFermer,
  children,
  largeurMax = "max-w-md",
}: {
  titre: string;
  onFermer: () => void;
  children: React.ReactNode;
  // Classe Tailwind de largeur max (ex. "max-w-3xl" pour un formulaire long) — "max-w-md" par défaut
  // (taille historique, confirmation courte type DevisCard.tsx).
  largeurMax?: string;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    function surEchap(e: KeyboardEvent) {
      if (e.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", surEchap);
    return () => document.removeEventListener("keydown", surEchap);
  }, [onFermer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label={t("commun.fermer")} className="absolute inset-0 bg-texte-principal/50" onClick={onFermer} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className={`relative max-h-[90vh] w-full ${largeurMax} overflow-y-auto rounded-xl bg-background p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-titres text-base font-semibold text-texte-principal">{titre}</p>
          <button type="button" aria-label={t("commun.fermer")} onClick={onFermer} className="text-texte-secondaire hover:text-texte-principal">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
