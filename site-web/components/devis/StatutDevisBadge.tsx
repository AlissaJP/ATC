import type { StatutDevis } from "@/lib/types/entities";

// RG-04-001 — étiquette de statut (Cahier 7 §4) : en_attente (gris), repondu (bleu), accepte (vert),
// refuse/expire (rouge), converti (bleu primaire).
const STYLES: Record<StatutDevis, { label: string; classe: string }> = {
  en_attente: { label: "En attente", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
  repondu: { label: "Répondu", classe: "bg-primaire-clair/10 text-primaire-clair" },
  accepte: { label: "Accepté", classe: "bg-succes/10 text-succes" },
  refuse: { label: "Refusé", classe: "bg-danger/10 text-danger" },
  expire: { label: "Expiré", classe: "bg-danger/10 text-danger" },
  converti: { label: "Converti en commande", classe: "bg-primaire/10 text-primaire" },
};

export function StatutDevisBadge({ statut }: { statut: StatutDevis }) {
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {label}
    </span>
  );
}
