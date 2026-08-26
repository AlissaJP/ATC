// Panier — état en mémoire côté client pour la démo (ECR-05-001).
// RG-03-004 / UC-05-001 (E1) : le prix unitaire est recalculé à chaque changement de quantité selon
// le barème applicable au profil de la session courante — jamais figé à l'ajout.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trouverStockParProduit } from "@/lib/mock-data/stock";
import { produits } from "@/lib/mock-data/produits";
import { resoudrePrixUnitaire } from "@/lib/services/prix";
import { resoudreProduitEtVariante, stockEffectifVariante } from "@/lib/services/variantes";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";

export interface LignePanier {
  produit_id: string;
  quantite: number;
  prix_unitaire_applique: number;
}

interface CartState {
  lignes: LignePanier[];
  // prixFixe : pour les composants d'un package pré-configuré (BF-04-001), dont le prix « tout compris »
  // affiché sur la fiche package ne doit pas être recalculé silencieusement par le barème B2B.
  ajouterLigne: (produit_id: string, quantite: number, prixFixe?: number) => void;
  retirerLigne: (produit_id: string) => void;
  modifierQuantite: (produit_id: string, quantite: number) => void;
  vider: () => void;
}

function estB2BSessionCourante(): boolean {
  return estClientB2BVerifie(useSessionStore.getState().session);
}

function quantiteAutorisee(produit_id: string, quantite: number): number {
  const resolu = resoudreProduitEtVariante(produit_id, produits);
  if (resolu?.variante) {
    const stockVariante = stockEffectifVariante(resolu.variante);
    // undefined = stock non suivi pour cette variante (point #29) — aucun plafond réel à appliquer.
    return stockVariante === undefined ? Math.max(0, quantite) : Math.max(0, Math.min(quantite, stockVariante));
  }
  const stockDisponible = trouverStockParProduit(produit_id)?.stock_actuel ?? 0;
  return Math.max(0, Math.min(quantite, stockDisponible));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lignes: [],
      ajouterLigne: (produit_id, quantite, prixFixe) =>
        set((state) => {
          const estB2B = estB2BSessionCourante();
          const existante = state.lignes.find((l) => l.produit_id === produit_id);
          const quantiteTotale = quantiteAutorisee(produit_id, (existante?.quantite ?? 0) + quantite);
          if (quantiteTotale === 0) return state;

          const ligneMaj: LignePanier = {
            produit_id,
            quantite: quantiteTotale,
            prix_unitaire_applique: prixFixe ?? resoudrePrixUnitaire(produit_id, quantiteTotale, estB2B),
          };

          return {
            lignes: existante
              ? state.lignes.map((l) => (l.produit_id === produit_id ? ligneMaj : l))
              : [...state.lignes, ligneMaj],
          };
        }),
      retirerLigne: (produit_id) =>
        set((state) => ({ lignes: state.lignes.filter((l) => l.produit_id !== produit_id) })),
      modifierQuantite: (produit_id, quantite) =>
        set((state) => {
          const quantiteFinale = quantiteAutorisee(produit_id, quantite);
          if (quantiteFinale === 0) {
            return { lignes: state.lignes.filter((l) => l.produit_id !== produit_id) };
          }
          const estB2B = estB2BSessionCourante();
          return {
            lignes: state.lignes.map((l) =>
              l.produit_id === produit_id
                ? {
                    ...l,
                    quantite: quantiteFinale,
                    prix_unitaire_applique: resoudrePrixUnitaire(produit_id, quantiteFinale, estB2B),
                  }
                : l
            ),
          };
        }),
      vider: () => set({ lignes: [] }),
    }),
    { name: "atc-panier" }
  )
);
