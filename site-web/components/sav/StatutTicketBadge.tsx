"use client";

import type { StatutTicketSAV } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Cycle non spécifié par le Cahier (voir lib/store/sav-store.ts) — modélisé par analogie avec
// StatutCommandeBadge.tsx.
const STYLES: Record<StatutTicketSAV, { label: string; classe: string }> = {
  ouvert: { label: "sav.statut.ouvert", classe: "bg-danger/10 text-danger" },
  en_cours: { label: "sav.statut.en_cours", classe: "bg-avertissement/10 text-avertissement" },
  resolu: { label: "sav.statut.resolu", classe: "bg-succes/10 text-succes" },
  ferme: { label: "sav.statut.ferme", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
};

export function StatutTicketBadge({ statut }: { statut: StatutTicketSAV }) {
  const { t } = useTranslation();
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {t(label)}
    </span>
  );
}
