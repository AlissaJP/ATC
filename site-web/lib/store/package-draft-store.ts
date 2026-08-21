// Brouillon de package personnalisé — capture le point de départ depuis la fiche produit
// (BF-03-004). Le configurateur complet (RG-04-002, RG-04-006) est construit en Phase 2.
"use client";

import { create } from "zustand";

interface PackageDraftState {
  produitsIds: string[];
  ajouterProduit: (produitId: string) => void;
  vider: () => void;
}

export const usePackageDraftStore = create<PackageDraftState>((set) => ({
  produitsIds: [],
  ajouterProduit: (produitId) =>
    set((state) =>
      state.produitsIds.includes(produitId)
        ? state
        : { produitsIds: [...state.produitsIds, produitId] }
    ),
  vider: () => set({ produitsIds: [] }),
}));
