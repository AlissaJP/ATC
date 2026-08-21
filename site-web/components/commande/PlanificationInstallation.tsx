"use client";

// UC-09-001 — Planifier une installation interne (BF-09-004, Must have, décision actée n°5).
// Scénario nominal : le client propose une date, l'agent SAV ou l'admin confirme/ajuste (côté admin,
// components/admin/GestionInstallations.tsx). Scénario d'erreur E1 : produit non éligible (RG-09-002,
// famille Énergie solaire uniquement) → l'option n'est simplement pas affichée.
import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { useInstallationStore } from "@/lib/store/installation-store";
import { commandeEstEligibleInstallation } from "@/lib/business-rules/installation-eligibilite";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import { StatutInstallationBadge } from "./StatutInstallationBadge";
import type { LigneCommande } from "@/lib/types/entities";

export function PlanificationInstallation({ commandeId, lignes }: { commandeId: string; lignes: LigneCommande[] }) {
  const toutesLesInstallations = useInstallationStore((s) => s.installations);
  const planifierInstallation = useInstallationStore((s) => s.planifierInstallation);
  const [dateProposee, setDateProposee] = useState("");

  const produitsCommande = useMemo(
    () => lignes.map((l) => produits.find((p) => p.id === l.produit_id)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [lignes]
  );
  const eligible = commandeEstEligibleInstallation(produitsCommande, categories);
  const installation = toutesLesInstallations.find((i) => i.commande_id === commandeId);

  if (!eligible) return null; // E1 — produit non éligible, aucune option affichée

  if (installation) {
    return (
      <div className="mt-5 rounded-xl border border-bordure bg-background p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Wrench size={20} className="mt-0.5 shrink-0 text-primaire-clair" />
            <div>
              <p className="font-titres text-sm font-semibold text-texte-principal">Installation solaire</p>
              <p className="mt-1 text-sm text-texte-secondaire">
                {new Date(installation.date_prevue).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </p>
              {installation.statut === "planifie" && (
                <p className="mt-1 text-xs text-texte-secondaire">En attente de confirmation par notre équipe.</p>
              )}
            </div>
          </div>
          <StatutInstallationBadge statut={installation.statut} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-bordure bg-background p-5">
      <div className="flex items-start gap-3">
        <Wrench size={20} className="mt-0.5 shrink-0 text-primaire-clair" />
        <div className="flex-1">
          <p className="font-titres text-sm font-semibold text-texte-principal">Planifier l&apos;installation</p>
          <p className="mt-1 text-sm text-texte-secondaire">
            Votre équipement solaire est éligible à l&apos;assistance à l&apos;installation par notre équipe interne.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="datetime-local"
              value={dateProposee}
              onChange={(e) => setDateProposee(e.target.value)}
              className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
            <button
              type="button"
              disabled={!dateProposee}
              onClick={() => planifierInstallation(commandeId, new Date(dateProposee).toISOString())}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proposer cette date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
