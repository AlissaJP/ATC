// EPIC-05 — Panier & Commande. RG-05-001 : statut de commande et retrait (décision actée n°27).
// Aucun module de livraison (règle absolue, section 8) — seul le statut « Prête pour retrait » existe.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Commande, LigneCommande, StatutCommande } from "@/lib/types/entities";
import type { LignePanier } from "@/lib/store/cart-store";

interface CommandeState {
  commandes: Commande[];
  lignesCommande: LigneCommande[];
  creerCommandeDepuisPanier: (utilisateurId: string, lignes: LignePanier[]) => Commande;
  creerCommandeDepuisDevis: (
    utilisateurId: string,
    devisId: string,
    montantTotal: number,
    lignes: { produit_id: string; quantite: number; prix_unitaire_applique: number }[]
  ) => Commande;
  marquerPreteRetrait: (commandeId: string) => void;
  marquerRetiree: (commandeId: string) => void;
  // ⚠️ Comme devis-store.ts / facture-store.ts : ne pas utiliser directement comme sélecteur d'un hook
  // réactif (nouveau tableau à chaque appel) — sélectionner le tableau brut et filtrer avec useMemo.
  commandesParUtilisateur: (utilisateurId: string) => Commande[];
  lignesParCommande: (commandeId: string) => LigneCommande[];
}

let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

export const useCommandeStore = create<CommandeState>()(
  persist(
    (set, get) => ({
      commandes: [],
      lignesCommande: [],

      creerCommandeDepuisPanier: (utilisateurId, lignes) => {
        const commande: Commande = {
          id: idUnique("commande"),
          utilisateur_id: utilisateurId,
          montant_total: lignes.reduce((s, l) => s + l.prix_unitaire_applique * l.quantite, 0),
          statut: "en_preparation",
          date_creation: new Date().toISOString(),
        };
        const lignesCommande: LigneCommande[] = lignes.map((l) => ({
          id: idUnique("ligne-commande"),
          commande_id: commande.id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire_applique: l.prix_unitaire_applique,
        }));
        set((state) => ({
          commandes: [commande, ...state.commandes],
          lignesCommande: [...state.lignesCommande, ...lignesCommande],
        }));
        return commande;
      },

      creerCommandeDepuisDevis: (utilisateurId, devisId, montantTotal, lignes) => {
        const commande: Commande = {
          id: idUnique("commande"),
          utilisateur_id: utilisateurId,
          devis_id: devisId,
          montant_total: montantTotal,
          statut: "en_preparation",
          date_creation: new Date().toISOString(),
        };
        const lignesCommande: LigneCommande[] = lignes.map((l) => ({
          id: idUnique("ligne-commande"),
          commande_id: commande.id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire_applique: l.prix_unitaire_applique,
        }));
        set((state) => ({
          commandes: [commande, ...state.commandes],
          lignesCommande: [...state.lignesCommande, ...lignesCommande],
        }));
        return commande;
      },

      marquerPreteRetrait: (commandeId) =>
        set((state) => ({
          commandes: state.commandes.map((c) =>
            c.id === commandeId
              ? { ...c, statut: "prete_retrait" as StatutCommande, date_pret_retrait: new Date().toISOString() }
              : c
          ),
        })),

      marquerRetiree: (commandeId) =>
        set((state) => ({
          commandes: state.commandes.map((c) =>
            c.id === commandeId
              ? { ...c, statut: "retiree" as StatutCommande, date_retrait: new Date().toISOString() }
              : c
          ),
        })),

      commandesParUtilisateur: (utilisateurId) => get().commandes.filter((c) => c.utilisateur_id === utilisateurId),
      lignesParCommande: (commandeId) => get().lignesCommande.filter((l) => l.commande_id === commandeId),
    }),
    { name: "atc-commandes" }
  )
);
