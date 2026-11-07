"use client";

import type { InstallationRdv } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

// BF-09-004 — 3 statuts définis par le dictionnaire (Cahier 9) : planifié, réalisé, annulé.
const STYLES: Record<InstallationRdv["statut"], { label: string; classe: string }> = {
  planifie: { label: "installation.statut.planifie", classe: "bg-avertissement/10 text-avertissement" },
  realise: { label: "installation.statut.realise", classe: "bg-succes/10 text-succes" },
  annule: { label: "installation.statut.annule", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
};

export function StatutInstallationBadge({ statut }: { statut: InstallationRdv["statut"] }) {
  const { t } = useTranslation();
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {t(label)}
    </span>
  );
}
