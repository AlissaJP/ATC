// EPIC-06 — Paiement & Facturation. RG-06-002 (facture pro forma), RG-06-001/003/004 (paiement).
// Comme lib/store/devis-store.ts : état interactif de démonstration, persisté en localStorage.
// Un règlement ou une facture peuvent se rattacher à un devis (paiement d'un devis accepté avant
// conversion — Phase 3) ou directement à une commande (achat panier — Phase 4), jamais les deux.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FactureProForma, MethodePaiement, Paiement } from "@/lib/types/entities";
import { calculerFacture } from "@/lib/business-rules/taxe";

export interface RattachementFacturation {
  devisId?: string;
  commandeId?: string;
}

interface EnregistrerPaiementInput extends RattachementFacturation {
  methode: MethodePaiement;
  montantUsd: number;
  montantHtg?: number;
  tauxChangeApplique?: number;
}

interface FactureState {
  facturesProForma: FactureProForma[];
  paiements: Paiement[];
  genererFactureProForma: (rattachement: RattachementFacturation, montantHT: number) => FactureProForma;
  enregistrerPaiement: (input: EnregistrerPaiementInput) => Paiement;
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

      enregistrerPaiement: ({ devisId, commandeId, methode, montantUsd, montantHtg, tauxChangeApplique }) => {
        const paiement: Paiement = {
          id: idUnique("paiement"),
          devis_id: devisId,
          commande_id: commandeId,
          methode,
          montant_usd: montantUsd,
          montant_htg: montantHtg,
          taux_change_applique: tauxChangeApplique,
          statut_transaction: "réussie", // sandbox de démo — décision actée n°41
          date_transaction: new Date().toISOString(),
        };
        set((state) => ({ paiements: [...state.paiements, paiement] }));
        return paiement;
      },

      factureParDevis: (devisId) => get().facturesProForma.find((f) => f.devis_id === devisId),
      factureParCommande: (commandeId) => get().facturesProForma.find((f) => f.commande_id === commandeId),
      paiementParDevis: (devisId) => get().paiements.find((p) => p.devis_id === devisId),
      paiementParCommande: (commandeId) => get().paiements.find((p) => p.commande_id === commandeId),
    }),
    { name: "atc-facturation" }
  )
);
