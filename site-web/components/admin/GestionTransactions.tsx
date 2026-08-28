"use client";

// BF-12-008 (Must have) — Suivi des transactions par méthode de paiement + factures pro forma
// (back-office). Gap identifié lors de l'audit qualité : useFactureStore n'était consommé nulle part
// côté admin. Accessible aux deux rôles (mêmes montants déjà visibles dans Devis/Commandes pour l'Agent
// SAV — RG-12-001 ne restreint que la gestion des prix catalogue et les Paramètres généraux).
import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useFactureStore } from "@/lib/store/facture-store";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import type { MethodePaiement, Paiement } from "@/lib/types/entities";

const LIBELLES_METHODE: Record<MethodePaiement, string> = {
  moncash: "MonCash",
  carte: "Carte Visa/Mastercard",
  paypal: "PayPal",
};

function nomClient(utilisateurId: string | undefined, utilisateursDynamiques: typeof utilisateursSeed): string {
  if (!utilisateurId) return "—";
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

// filtreInitial : reçu de la page (Server Component, lit searchParams) pour les raccourcis « Paiements »
// de la navigation latérale (Section Administration, Raffinement Design — Tous/MonCash/Carte/PayPal).
export function GestionTransactions({ filtreInitial = "tous" }: { filtreInitial?: MethodePaiement | "tous" }) {
  const paiements = useFactureStore((s) => s.paiements);
  const facturesProForma = useFactureStore((s) => s.facturesProForma);
  const devis = useDevisStore((s) => s.devis);
  const commandes = useCommandeStore((s) => s.commandes);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const [filtre, setFiltre] = useState<MethodePaiement | "tous">(filtreInitial);

  // Un clic sur un sous-lien de la sidebar navigue vers la même route avec un `methode` différent : React
  // ne réinitialise pas l'état local de ce composant client pour autant, donc on resynchronise le filtre
  // pendant le rendu plutôt qu'un useEffect (même correction que TraitementDevis.tsx/GestionCatalogue.tsx).
  const [filtreInitialTraite, setFiltreInitialTraite] = useState(filtreInitial);
  if (filtreInitial !== filtreInitialTraite) {
    setFiltreInitialTraite(filtreInitial);
    setFiltre(filtreInitial);
  }

  const utilisateurDuPaiement = (p: Paiement): string | undefined => {
    if (p.devis_id) return devis.find((d) => d.id === p.devis_id)?.utilisateur_id;
    if (p.commande_id) return commandes.find((c) => c.id === p.commande_id)?.utilisateur_id;
    return undefined;
  };

  const factureDuPaiement = (p: Paiement) =>
    facturesProForma.find((f) => (p.devis_id && f.devis_id === p.devis_id) || (p.commande_id && f.commande_id === p.commande_id));

  const paiementsFiltres = useMemo(
    () =>
      [...paiements]
        .filter((p) => filtre === "tous" || p.methode === filtre)
        .sort((a, b) => new Date(b.date_transaction).getTime() - new Date(a.date_transaction).getTime()),
    [paiements, filtre]
  );

  const totalUsd = paiementsFiltres.reduce((s, p) => s + p.montant_usd, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["tous", "moncash", "carte", "paypal"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filtre === f ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
              }`}
            >
              {f === "tous" ? "Toutes" : LIBELLES_METHODE[f]}
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-texte-principal">Total : ${totalUsd.toFixed(2)}</p>
      </div>

      {paiementsFiltres.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucune transaction pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {paiementsFiltres.map((p) => {
            const facture = factureDuPaiement(p);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-bordure bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-texte-principal">
                    {nomClient(utilisateurDuPaiement(p), utilisateursDynamiques)} — {LIBELLES_METHODE[p.methode]}
                  </p>
                  <p className="text-xs text-texte-secondaire">
                    {new Date(p.date_transaction).toLocaleString("fr-FR")} — ${p.montant_usd.toFixed(2)}
                    {p.montant_htg !== undefined && ` (${p.montant_htg.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} HTG)`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.statut_transaction === "réussie"
                        ? "bg-succes/10 text-succes"
                        : p.statut_transaction === "échouée"
                          ? "bg-danger/10 text-danger"
                          : "bg-avertissement/10 text-avertissement"
                    }`}
                  >
                    {p.statut_transaction}
                  </span>
                  {facture && (
                    <Link
                      href={`/facture/${facture.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-primaire hover:underline"
                    >
                      <FileText size={12} /> Facture
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
