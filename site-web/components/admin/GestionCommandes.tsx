"use client";

import { useMemo } from "react";
import { ArrowRightCircle, PackageCheck } from "lucide-react";
import { StatutCommandeBadge } from "@/components/commande/StatutCommandeBadge";
import { useCommandeStore } from "@/lib/store/commande-store";
import { utilisateurs } from "@/lib/mock-data/utilisateurs";
import type { Commande } from "@/lib/types/entities";

function nomClient(utilisateurId: string): string {
  return utilisateurs.find((u) => u.id === utilisateurId)?.nom ?? "Client";
}

// RG-05-001 — statut de commande et retrait (décision actée n°27) : en_preparation → prete_retrait →
// retiree. Aucune étape de livraison.
function LigneCommande({ commande }: { commande: Commande }) {
  const marquerPreteRetrait = useCommandeStore((s) => s.marquerPreteRetrait);
  const marquerRetiree = useCommandeStore((s) => s.marquerRetiree);

  return (
    <div className="flex items-center justify-between rounded-xl border border-bordure bg-background p-4">
      <div>
        <p className="text-sm font-medium text-texte-principal">
          #{commande.id.slice(-8).toUpperCase()} — {nomClient(commande.utilisateur_id)}
        </p>
        <p className="text-xs text-texte-secondaire">
          {new Date(commande.date_creation).toLocaleDateString("fr-FR")} — ${commande.montant_total.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatutCommandeBadge statut={commande.statut} />
        {commande.statut === "en_preparation" && (
          <button
            type="button"
            onClick={() => marquerPreteRetrait(commande.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            <ArrowRightCircle size={14} /> Prête pour retrait
          </button>
        )}
        {commande.statut === "prete_retrait" && (
          <button
            type="button"
            onClick={() => marquerRetiree(commande.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-3 py-1.5 text-xs font-semibold text-texte-principal hover:bg-fond"
          >
            <PackageCheck size={14} /> Marquer retirée
          </button>
        )}
      </div>
    </div>
  );
}

export function GestionCommandes() {
  const commandes = useCommandeStore((s) => s.commandes);
  const triees = useMemo(
    () => [...commandes].sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [commandes]
  );

  if (triees.length === 0) {
    return <p className="text-sm text-texte-secondaire">Aucune commande pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {triees.map((c) => (
        <LigneCommande key={c.id} commande={c} />
      ))}
    </div>
  );
}
