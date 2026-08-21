import type { StatutCommande } from "@/lib/types/entities";

// RG-05-001 — statuts de commande (Cahier 7 §4) : en préparation (gris), prête pour retrait (ambre),
// retirée (vert). Aucun statut de livraison — retrait uniquement (règle absolue, section 8).
const STYLES: Record<StatutCommande, { label: string; classe: string }> = {
  en_preparation: { label: "En préparation", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
  prete_retrait: { label: "Prête pour retrait", classe: "bg-avertissement/10 text-avertissement" },
  retiree: { label: "Retirée", classe: "bg-succes/10 text-succes" },
};

export function StatutCommandeBadge({ statut }: { statut: StatutCommande }) {
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {label}
    </span>
  );
}
