// EPIC-06 — Paiement & Facturation. RG-06-002 (facture pro forma), RG-06-001/003/004 (paiement).
// Comme lib/store/devis-store.ts : état interactif de démonstration, persisté en localStorage.
// Un règlement ou une facture peuvent se rattacher à un devis (paiement d'un devis accepté avant
// conversion — Phase 3) ou directement à une commande (achat panier — Phase 4), jamais les deux.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DetailVirement, FactureProForma, MethodePaiement, Paiement } from "@/lib/types/entities";
import { calculerFacture } from "@/lib/business-rules/taxe";
import { useCommandeStore } from "@/lib/store/commande-store";

export interface RattachementFacturation {
  devisId?: string;
  commandeId?: string;
}

interface EnregistrerPaiementInput extends RattachementFacturation {
  methode: MethodePaiement;
  montantUsd: number;
  montantHtg?: number;
  tauxChangeApplique?: number;
  virement?: Pick<DetailVirement, "compte" | "preuve">;
}

// Un règlement refusé (virement) reste dans l'historique et le client peut payer à nouveau : l'état d'une
// commande ou d'un devis se lit donc sur son DERNIER paiement, pas sur le premier trouvé.
export function dernierPaiement(paiements: Paiement[], { devisId, commandeId }: RattachementFacturation): Paiement | undefined {
  return paiements
    .filter((p) => (devisId ? p.devis_id === devisId : p.commande_id === commandeId))
    .reduce<Paiement | undefined>((dernier, p) => (!dernier || p.date_transaction >= dernier.date_transaction ? p : dernier), undefined);
}

interface FactureState {
  facturesProForma: FactureProForma[];
  paiements: Paiement[];
  genererFactureProForma: (rattachement: RattachementFacturation, montantHT: number) => FactureProForma;
  enregistrerPaiement: (input: EnregistrerPaiementInput) => Paiement;
  // Vérification manuelle d'un virement par l'Administrateur Général (preuve examinée) : la validation
  // passe la commande rattachée en préparation ; un refus laisse le client régler à nouveau.
  validerVirement: (paiementId: string, administrateur: string) => void;
  refuserVirement: (paiementId: string, administrateur: string, motif: string) => void;
  // ⚠️ Comme dans devis-store.ts : ne pas utiliser directement comme sélecteur d'un hook réactif
  // (nouveau tableau à chaque appel) — sélectionner le tableau brut et filtrer avec useMemo.
  factureParDevis: (devisId: string) => FactureProForma | undefined;
  factureParCommande: (commandeId: string) => FactureProForma | undefined;
  paiementParDevis: (devisId: string) => Paiement | undefined;
  paiementParCommande: (commandeId: string) => Paiement | undefined;
}

let compteurFacture = 0;
let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

function prochainNumeroSequentiel(): string {
  compteurFacture += 1;
  const annee = new Date().getFullYear();
  return `FP-${annee}-${String(compteurFacture).padStart(4, "0")}`;
}

export const useFactureStore = create<FactureState>()(
  persist(
    (set, get) => ({
      facturesProForma: [],
      paiements: [],

      genererFactureProForma: ({ devisId, commandeId }, montantHT) => {
        const detail = calculerFacture(montantHT);
        const facture: FactureProForma = {
          id: idUnique("facture"),
          numero_sequentiel: prochainNumeroSequentiel(),
          devis_id: devisId,
          commande_id: commandeId,
          montant_ht: detail.montant_ht,
          taux_taxe: detail.taux_taxe,
          montant_taxe: detail.montant_taxe,
          montant_ttc: detail.montant_ttc,
          date_generation: new Date().toISOString(),
        };
        set((state) => ({ facturesProForma: [...state.facturesProForma, facture] }));
        return facture;
      },

      enregistrerPaiement: ({ devisId, commandeId, methode, montantUsd, montantHtg, tauxChangeApplique, virement }) => {
        const paiement: Paiement = {
          id: idUnique("paiement"),
          devis_id: devisId,
          commande_id: commandeId,
          methode,
          montant_usd: montantUsd,
          montant_htg: montantHtg,
          taux_change_applique: tauxChangeApplique,
          // Virement : en attente de vérification de la preuve. Autres moyens : sandbox de démo, la
          // transaction aboutit toujours (décision actée n°41).
          statut_transaction: methode === "virement" ? "en cours" : "réussie",
          date_transaction: new Date().toISOString(),
          virement,
        };
        set((state) => ({ paiements: [...state.paiements, paiement] }));
        if (commandeId) {
          // Un virement met la commande en attente de vérification ; un autre moyen (sandbox, toujours abouti)
          // la valide, y compris quand il remplace un virement refusé.
          const commandes = useCommandeStore.getState();
          if (methode === "virement") commandes.mettreEnAttentePaiement(commandeId);
          else commandes.confirmerPaiement(commandeId);
        }
        return paiement;
      },

      validerVirement: (paiementId, administrateur) => {
        const paiement = get().paiements.find((p) => p.id === paiementId);
        if (!paiement?.virement || paiement.statut_transaction !== "en cours") return;
        set((state) => ({
          paiements: state.paiements.map((p) =>
            p.id === paiementId && p.virement
              ? {
                  ...p,
                  statut_transaction: "réussie",
                  virement: { ...p.virement, date_verification: new Date().toISOString(), verifie_par: administrateur },
                }
              : p
          ),
        }));
        // Commande validée : elle rejoint la liste des commandes du client (en préparation). Un devis réglé
        // par virement suit ensuite le circuit habituel (conversion en commande par l'équipe ATC).
        if (paiement.commande_id) useCommandeStore.getState().confirmerPaiement(paiement.commande_id);
      },

      refuserVirement: (paiementId, administrateur, motif) => {
        set((state) => ({
          paiements: state.paiements.map((p) =>
            p.id === paiementId && p.virement && p.statut_transaction === "en cours"
              ? {
                  ...p,
                  statut_transaction: "échouée",
                  virement: {
                    ...p.virement,
                    date_verification: new Date().toISOString(),
                    verifie_par: administrateur,
                    motif_refus: motif,
                  },
                }
              : p
          ),
        }));
      },

      factureParDevis: (devisId) => get().facturesProForma.find((f) => f.devis_id === devisId),
      factureParCommande: (commandeId) => get().facturesProForma.find((f) => f.commande_id === commandeId),
      paiementParDevis: (devisId) => dernierPaiement(get().paiements, { devisId }),
      paiementParCommande: (commandeId) => dernierPaiement(get().paiements, { commandeId }),
    }),
    { name: "atc-facturation" }
  )
);
