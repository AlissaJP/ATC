import type { InstallationRdv } from "@/lib/types/entities";

// BF-09-004 — 3 statuts définis par le dictionnaire (Cahier 9) : planifié, réalisé, annulé.
const STYLES: Record<InstallationRdv["statut"], { label: string; classe: string }> = {
  planifie: { label: "Planifiée", classe: "bg-avertissement/10 text-avertissement" },
  realise: { label: "Réalisée", classe: "bg-succes/10 text-succes" },
  annule: { label: "Annulée", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
};

export function StatutInstallationBadge({ statut }: { statut: InstallationRdv["statut"] }) {
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {label}
    </span>
  );
}
