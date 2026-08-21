import type { StatutTicketSAV } from "@/lib/types/entities";

// Cycle non spécifié par le Cahier (voir lib/store/sav-store.ts) — modélisé par analogie avec
// StatutCommandeBadge.tsx.
const STYLES: Record<StatutTicketSAV, { label: string; classe: string }> = {
  ouvert: { label: "Ouvert", classe: "bg-danger/10 text-danger" },
  en_cours: { label: "En cours", classe: "bg-avertissement/10 text-avertissement" },
  resolu: { label: "Résolu", classe: "bg-succes/10 text-succes" },
  ferme: { label: "Fermé", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
};

export function StatutTicketBadge({ statut }: { statut: StatutTicketSAV }) {
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {label}
    </span>
  );
}
