"use client";

import { useMemo, useState } from "react";
import { ArrowRightCircle, PackageCheck } from "lucide-react";
import { StatutCommandeBadge } from "@/components/commande/StatutCommandeBadge";
import { useCommandeStore } from "@/lib/store/commande-store";
import { utilisateurs } from "@/lib/mock-data/utilisateurs";
import type { Commande, StatutCommande } from "@/lib/types/entities";

function nomClient(utilisateurId: string): string {
  return utilisateurs.find((u) => u.id === utilisateurId)?.nom ?? "Client";
}

const FILTRES: { valeur: StatutCommande | "tous"; label: string }[] = [
  { valeur: "en_preparation", label: "En préparation" },
  { valeur: "prete_retrait", label: "Prêtes pour retrait" },
  { valeur: "retiree", label: "Retirées" },
  { valeur: "tous", label: "Toutes" },
];

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

// filtreInitial : reçu de la page (Server Component, lit searchParams) pour les raccourcis de la
// navigation latérale (Section Administration, Raffinement Design — En préparation/Prêtes/Retirées).
export function GestionCommandes({ filtreInitial = "tous" }: { filtreInitial?: StatutCommande | "tous" }) {
  const commandes = useCommandeStore((s) => s.commandes);
  const [filtre, setFiltre] = useState<StatutCommande | "tous">(filtreInitial);

  const triees = useMemo(
    () =>
      [...commandes]
        .filter((c) => filtre === "tous" || c.statut === filtre)
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [commandes, filtre]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filtre === f.valeur ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {triees.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucune commande dans ce filtre.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {triees.map((c) => (
            <LigneCommande key={c.id} commande={c} />
          ))}
        </div>
      )}
    </div>
  );
}
