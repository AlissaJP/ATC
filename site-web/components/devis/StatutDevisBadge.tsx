"use client";

import type { StatutDevis } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

// RG-04-001 — étiquette de statut (Cahier 7 §4) : en_attente (gris), repondu (bleu), accepte (vert),
// refuse/expire (rouge), converti (bleu primaire).
const STYLES: Record<StatutDevis, { label: string; classe: string }> = {
  en_attente: { label: "devis.statut.en_attente", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
  repondu: { label: "devis.statut.repondu", classe: "bg-primaire-clair/10 text-primaire-clair" },
  accepte: { label: "devis.statut.accepte", classe: "bg-succes/10 text-succes" },
  refuse: { label: "devis.statut.refuse", classe: "bg-danger/10 text-danger" },
  expire: { label: "devis.statut.expire", classe: "bg-danger/10 text-danger" },
  converti: { label: "devis.statut.converti", classe: "bg-primaire/10 text-primaire" },
};

export function StatutDevisBadge({ statut }: { statut: StatutDevis }) {
  const { t } = useTranslation();
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {t(label)}
    </span>
  );
}
