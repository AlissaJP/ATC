"use client";

import type { StatutCommande } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

// RG-05-001 — statuts de commande (Cahier 7 §4) : en préparation (gris), prête pour retrait (ambre),
// retirée (vert), précédés du paiement par virement en attente de vérification (bleu). Aucun statut de
// livraison — retrait uniquement (règle absolue, section 8).
const STYLES: Record<StatutCommande, { label: string; classe: string }> = {
  attente_paiement: { label: "commandes.statut.attente_paiement", classe: "bg-primaire/10 text-primaire" },
  en_preparation: { label: "commandes.statut.en_preparation", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
  prete_retrait: { label: "commandes.statut.prete_retrait", classe: "bg-avertissement/10 text-avertissement" },
  retiree: { label: "commandes.statut.retiree", classe: "bg-succes/10 text-succes" },
};

export function StatutCommandeBadge({ statut }: { statut: StatutCommande }) {
  const { t } = useTranslation();
  const { label, classe } = STYLES[statut];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>
      {t(label)}
    </span>
  );
}
