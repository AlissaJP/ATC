"use client";

import type { NiveauAlerteStock } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

// RG-03-002 — 4 états de stock. Le texte porte l'information, pas seulement la couleur (WCAG 2.2 AA).
// Stock non suivi : aucun badge (audit A-11).
const STYLES: Record<Exclude<NiveauAlerteStock, "non_suivi">, { label: string; classe: string }> = {
  en_stock: { label: "produit.enStock", classe: "bg-succes/10 text-succes" },
  alerte_orange: { label: "produit.alerteOrange", classe: "bg-avertissement/10 text-avertissement" },
  alerte_rouge: { label: "produit.alerteRouge", classe: "bg-danger/10 text-danger" },
  rupture: { label: "produit.rupture", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
};

export function StockBadge({ niveau }: { niveau: NiveauAlerteStock }) {
  const { t } = useTranslation();
  if (niveau === "non_suivi") return null;
  const { label, classe } = STYLES[niveau];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}
    >
      {t(label)}
    </span>
  );
}
